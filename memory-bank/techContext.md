# FinanceTrackerMulti - Tech Context

## Technology Stack Details

### **Frontend Technologies**

#### **Core Framework**
- **React 18.3**: Latest React with concurrent features and automatic batching
- **TypeScript 5.3**: Strict type checking for financial data accuracy
- **Vite 5.1**: Fast development server, optimized builds, and ESM support

#### **UI & Styling**
- **Tailwind CSS 3.4**: Utility-first CSS framework for responsive design
- **Shadcn/ui**: Modern component library built on Radix UI primitives
- **Radix UI**: Accessible, customizable component primitives
- **Lucide Icons**: Consistent icon library with all financial icons
- **Recharts**: React charting library for dashboard analytics

#### **Routing & State**
- **React Router 6.8**: Client-side routing with nested routes
- **Convex React**: Real-time data fetching and mutations
- **React Context**: Global state management for theme and currency

### **Backend Technologies**

#### **Serverless Backend**
- **Convex 1.5**: Real-time serverless database and authentication
- **Bun 1.4**: Fast runtime and package manager for development server
- **Express**: HTTP server for custom routes (when needed)

#### **Database**
- **Convex Document Database**: Schema-driven, indexed document storage
- **Real-time subscriptions**: Automatic UI updates on data changes
- **Type-safe queries**: Generated TypeScript types from schema

### **Development & Build Tools**

#### **Package Management**
- **Bun**: High-performance package installer and task runner
- **npm**: Fallback package management and deployment

#### **Code Quality**
- **ESLint**: Code linting for TypeScript and React
- **Prettier**: Code formatting for consistency
- **TypeScript Compiler**: Strict compilation checking

#### **Development Server**
- **Vite Dev Server**: Hot module replacement, fast refresh
- **Convex Dev Server**: Local backend development environment

## Development Setup

### **Prerequisites**
- Node.js 18+ (recommended 20+)
- Bun 1.0+ for optimal performance
- VS Code with TypeScript and React extensions
- Git for version control

### **Installation & Setup**
```bash
# Clone repository
git clone <repository-url>
cd FinanceTrackerMulti

# Install dependencies (Bun recommended for speed)
bun install

# Start development servers
bun run dev  # Starts both frontend and backend

# Alternative with npm
npm install
npm run dev
```

### **Environment Configuration**
```typescript
// Development
NODE_ENV=development
CONVEX_DEV=true

// Production
NODE_ENV=production
CONVEX_DEPLOY_KEY=<deployment-key>
```

## Technical Constraints

### **Performance Constraints**
- **Real-time updates**: Must handle 100ms+ update latencies
- **Large datasets**: Optimize for 10k+ financial records per module
- **Mobile performance**: Bundle size under 1MB for mobile loading
- **Currency calculations**: Handle multi-currency conversions accurately

### **Browser Support**
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive Enhancement**: Graceful fallbacks for older browsers

### **Security Constraints**
- **Financial data protection**: All sensitive data encrypted in transit
- **User authentication**: Role-based access control implemented
- **Data validation**: Server-side validation for financial calculations
- **Input sanitization**: Prevent malicious data entry

## Dependencies & Libraries

### **Core Dependencies** (`package.json`)

#### **Runtime Dependencies**
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "convex": "^1.5.0",
  "recharts": "^2.8.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-dialog": "^1.0.4",
  "@shadcn/ui": "latest",
  "lucide-react": "^0.294.0"
}
```

#### **Development Dependencies**
```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "eslint": "^8.45.0",
  "prettier": "^3.0.0",
  "vite": "^5.1.0"
}
```

### **Key Libraries Usage**

#### **Currency Conversion**
```typescript
// lib/currency-utils.ts
export type Currency = "USD" | "SAR" | "AED";

const EXCHANGE_RATES = {
  USD_TO_SAR: 3.75,
  USD_TO_AED: 3.67,
};

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  // Accurate conversion logic
}
```

#### **Excel Export**
```typescript
// lib/excel-export.ts
import * as XLSX from 'xlsx';

export function exportSalesData(data: Sale[], currency: Currency) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');

  XLSX.writeFile(workbook, 'sales-export.xlsx');
}
```

## Development Workflow Patterns

### **Version Control**
- **Git Flow**: Feature branches with PR reviews
- **Commit Messages**: Conventional format for automated tooling
- **Branch Naming**: `feature/`, `bugfix/`, `hotfix/` prefixes

### **Code Organization**
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── dashboard/     # Dashboard-specific components
│   └── CurrencySelector.tsx
├── pages/              # Route-level page components
├── lib/               # Utility functions and helpers
├── hooks/            # Custom React hooks
├── convex/           # Backend functions and schema
└── types/           # TypeScript type definitions
```

### **Component Architecture**
- **Small, focused components**: Single responsibility principle
- **Composition over inheritance**: Build complex UI from simple pieces
- **Prop drilling avoidance**: Context and custom hooks for shared state
- **TypeScript interfaces**: Strict typing for component props

### **Testing Strategy**
```typescript
// Potential testing configuration
{
  "test": {
    "framework": "Vitest",
    "environment": "jsdom",
    "setupFiles": ["./src/test/setup.ts"],
    "testFiles": [
      "src/**/*.test.tsx",
      "src/**/*.test.ts"
    ]
  }
}
```

## Deployment & Hosting

### **Development Deployment**
- **Convex Dev**: Local backend development
- **Vite Dev**: Local frontend development
- **Hot Reload**: Instant feedback on code changes

### **Production Deployment**
- **Vercel/Netlify**: Frontend static hosting
- **Convex Cloud**: Backend and database hosting
- **CDN**: Global content delivery for assets

### **Build Process**
```bash
# Production build
npm run build          # Build frontend
npx convex deploy     # Deploy backend
npx convex run deploy # Seed production data
```

### **Performance Optimization**
- **Bundle Analysis**: Automated bundle size monitoring
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Automatic WebP conversion and compression
- **Caching**: Aggressive caching for static assets

## Integration Points

### **Currency API Integration**
```typescript
// Potential future currency API
const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  const response = await fetch('https://api.currencyapi.com/rates');
  return response.json();
};
```

### **Export Service Integration**
- **Google Sheets**: Direct export integration
- **QuickBooks**: Accounting software sync
- **Excel Templates**: Customizable export formats

### **Admin Panel Integration**
- **Database Seeding**: Programmatic test data generation
- **User Management**: Role-based access control
- **Data Backup**: Automated export capabilities

## Future Scalability Considerations

### **Performance Scaling**
- **Database Indexing**: Strategic indexes for query performance
- **Pagination**: Efficient loading for large datasets
- **Caching Strategy**: CDN and service worker caching

### **Feature Extensibility**
- **Plugin Architecture**: Module-based feature additions
- **Custom Fields**: User-definable additional data fields
- **Multi-tenancy**: Organization-level data isolation

### **Internationalization**
- **i18n Support**: Multiple language support structure
- **Date Formatting**: Locale-specific date and number formatting
- **Currency Expansion**: Additional currency support

## Monitoring & Debugging

### **Development Tools**
- **React DevTools**: Component inspection and profiling
- **Convex Dashboard**: Backend query and mutation monitoring
- **Browser DevTools**: Network, performance, and console debugging

### **Production Monitoring**
- **Error Tracking**: Sentry or similar for error monitoring
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Usage patterns and feature adoption

### **Debug Configuration**
```typescript
// Debug flags for development
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Development mode: enabling verbose logging');
}
```

This comprehensive technical context ensures that all development decisions are made with full awareness of the technology stack, constraints, and future scalability requirements.
