const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(directoryPath).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Remove import
  if (content.includes('react-hook-form')) {
    content = content.replace(/import\s*\{[^}]*useForm[^}]*\}\s*from\s*["']react-hook-form["'];?/g, '');
    changed = true;
  }

  // Replace useForm<Type>() with useState
  const useFormRegex = /const\s*\{\s*register\s*,\s*handleSubmit(?:[^}]*)\}\s*=\s*useForm(?:<([^>]+)>)?\(\s*\);?/g;
  let match;
  while ((match = useFormRegex.exec(content)) !== null) {
    const type = match[1] || 'any';
    // We assume an empty object for default state. It might cause TS errors if properties are required, 
    // but we can cast it as the type.
    const replacement = `const [formData, setFormData] = useState<${type}>({} as ${type});`;
    content = content.replace(match[0], replacement);
    changed = true;
  }

  // Handle useForm with defaultValues
  const useFormDefaultRegex = /const\s*\{\s*register\s*,\s*handleSubmit(?:[^}]*)\}\s*=\s*useForm(?:<([^>]+)>)?\(\s*\{\s*defaultValues\s*:\s*(\{[^}]+\})\s*\}?\s*\);?/g;
  while ((match = useFormDefaultRegex.exec(content)) !== null) {
    const type = match[1] || 'any';
    const defaultVals = match[2];
    const replacement = `const [formData, setFormData] = useState<${type}>(${defaultVals});`;
    content = content.replace(match[0], replacement);
    changed = true;
  }

  // Replace {...register("fieldName")}
  const registerRegex = /\{\.\.\.register\(\s*["']([^"']+)["']\s*\)\}/g;
  content = content.replace(registerRegex, (match, fieldName) => {
    return `value={formData.${fieldName} || ""} onChange={(e) => setFormData({ ...formData, ${fieldName}: e.target.value })}`;
  });

  // Replace handleSubmit(onSubmit) -> we can't easily rewrite the function definition if it's wrapped,
  // but we can look for `onSubmit={handleSubmit(onSubmit)}` and replace it with `onSubmit={handleFormSubmit}`
  // and inject `handleFormSubmit` above it.
  // Actually, replacing `const onSubmit = handleSubmit(async (data) => {`
  const handleSubmitWrapper = /const\s+([a-zA-Z0-9_]+)\s*=\s*handleSubmit\(\s*async\s*\(([^)]+)\)\s*=>\s*\{/g;
  content = content.replace(handleSubmitWrapper, (match, funcName, paramName) => {
    return `const ${funcName} = async (e: React.FormEvent) => {\n    e.preventDefault();\n    const ${paramName} = formData;\n`;
  });

  // Handle non-async handleSubmit
  const handleSubmitWrapperSync = /const\s+([a-zA-Z0-9_]+)\s*=\s*handleSubmit\(\s*\(([^)]+)\)\s*=>\s*\{/g;
  content = content.replace(handleSubmitWrapperSync, (match, funcName, paramName) => {
    return `const ${funcName} = (e: React.FormEvent) => {\n    e.preventDefault();\n    const ${paramName} = formData;\n`;
  });

  // Handle inline onSubmit={handleSubmit(onSubmit)}
  if (content.includes('onSubmit={handleSubmit(')) {
    content = content.replace(/onSubmit=\{handleSubmit\(([^)]+)\)\}/g, 'onSubmit={(e) => { e.preventDefault(); $1(formData); }}');
  }

  // Handle `errors.fieldName`
  // We can just define `const errors: any = {};` at the top of the component to suppress TS errors
  // since we removed zod validation.
  if (content.includes('errors.') && !content.includes('const errors')) {
      // Find the component definition to inject
      const compRegex = /(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{|export\s+default\s+function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/;
      content = content.replace(compRegex, `$1\n  const errors: any = {};\n`);
  }
  
  if (content.includes('isSubmitting') && !content.includes('const [isSubmitting')) {
      const compRegex = /(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{|export\s+default\s+function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/;
      content = content.replace(compRegex, `$1\n  const [isSubmitting, setIsSubmitting] = useState(false);\n`);
  }

  // Fix watch() -> formData
  content = content.replace(/watch\(\s*["']([^"']+)["']\s*\)/g, 'formData.$1');

  // Fix setValue("field", val) -> setFormData({ ...formData, field: val })
  // Since we don't have access to the old state easily in a regex, we can define a helper `setValue` 
  if (content.includes('setValue(') && !content.includes('const setValue =')) {
      const compRegex = /(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{|export\s+default\s+function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/;
      content = content.replace(compRegex, `$1\n  const setValue = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));\n`);
  }

  // Fix reset() -> setFormData(defaultVals)
  if (content.includes('reset(') && !content.includes('const reset =')) {
      const compRegex = /(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{|export\s+default\s+function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/;
      content = content.replace(compRegex, `$1\n  const reset = (vals?: any) => setFormData(vals || {});\n`);
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Refactored:', file);
  }
});
