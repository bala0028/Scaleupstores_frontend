import config from "./clientConfig";

const COLOR_TOKEN_MAP: Record<string, string> = {
  brand: "--color-brand",
  brandAction: "--color-brand-action",
  brandHover: "--color-brand-action-hover",
  brandCream: "--color-brand-cream",
  brandBorder: "--color-brand-border",
  brandBorderLight: "--color-brand-border-light",
};

const FONT_TOKEN_MAP: Record<string, string> = {
  body: "--font-body",
  heading: "--font-heading",
  brand: "--font-brand",
};

export function applyTheme(): void {
  const theme = config.theme;
  if (!theme) return;
  const root = document.documentElement;

  // Apply color overrides
  for (const [key, cssVar] of Object.entries(COLOR_TOKEN_MAP)) {
    const value = theme[key as keyof typeof theme];
    if (value && typeof value === "string") root.style.setProperty(cssVar, value);
  }

  // Apply font overrides
  const fonts = theme.fonts;
  if (fonts) {
    // Inject custom Google Fonts URL if provided
    if (fonts.googleFontsUrl) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fonts.googleFontsUrl;
      document.head.appendChild(link);
    }
    // Override font CSS vars
    for (const [key, cssVar] of Object.entries(FONT_TOKEN_MAP)) {
      const value = fonts[key as keyof typeof fonts];
      if (value) root.style.setProperty(cssVar, value);
    }
  }
}
