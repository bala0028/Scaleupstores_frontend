# ScaleUp Stores - Multi-Tenant Ecommerce Frontend

A unified, config-based React monorepo for deploying multiple ecommerce stores with separate admin and customer interfaces.

## 🏗️ Architecture

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (cart, filters) + Context API (auth, config)
- **Routing**: React Router v7
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── admin/              # Admin pages and components
├── customer/           # Customer pages and components
├── shared/             # Shared code
│   ├── components/ui/  # shadcn/ui components
│   ├── stores/         # Zustand stores
│   ├── context/        # React Context providers
│   ├── api/            # API client and endpoints
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   └── constants/      # Constants
└── routes/             # Route definitions
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd monorepo-frontend
bun install
```

### 2. Configure for Client

```bash
# Copy example files
cp config.example.js config.js
cp .env.example .env

# Edit config.js with client-specific settings
# Edit .env with environment variables
# Add client logo to public/logo.png
```

### 3. Run Development Server

```bash
bun run dev
```

- Admin: http://localhost:5173 (or configure domain routing)
- Customer: http://localhost:5173

### 4. Build for Production

```bash
bun run build
```

## 🎨 Customization

### Theme Colors

Edit `config.js`:

```javascript
theme: {
  primary: "#3B82F6",
  secondary: "#10B981",
  // ...
}
```

### Feature Flags

Enable/disable features per client:

```javascript
features: {
  reviews: true,
  wishlist: true,
  giftCards: false,
  // ...
}
```

## 🌐 Domain Routing

The app automatically detects the domain and serves the appropriate interface:

- `admin.clientname.com` → Admin Interface
- `www.clientname.com` → Customer Interface

## 📦 Deployment Workflow

```bash
# 1. Configure for client
cp ~/client-configs/client1/config.js ./config.js
cp ~/client-configs/client1/.env ./.env
cp ~/client-configs/client1/logo.png ./public/logo.png

# 2. Build
bun run build

# 3. Deploy
scp -r dist/* ubuntu@client-server:/var/www/html/
```

## 🧪 Testing

```bash
# Run tests
bun test

# Run React Doctor
bunx react-doctor
```

## 📝 Development Guidelines

- Max 200 lines per component
- Max 10 props per component
- Use React.memo for pure components
- Use useMemo for expensive calculations
- Use useCallback for functions passed to memoized components
- Never use array index as key

## 🔧 Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

## 📚 Documentation

- [Coding Standards](../CODING_STANDARDS.md)
- [Project Plan](../PROJECT_PLAN.md)
- [Codebase Analysis](../CODEBASE_ANALYSIS.md)

## 🎯 Target

- **Clients**: 50-100+ independent deployments
- **Build Time**: < 30 seconds
- **Onboarding Time**: 5-10 minutes per client
- **Lighthouse Score**: 90+
- **React Doctor Score**: 95+

## 📄 License

Proprietary - ScaleUp Stores
