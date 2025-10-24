# FinanceTrackerMulti - System Patterns

## System Architecture

### **Frontend Architecture**
- **React + TypeScript**: Type-safe component development
- **Vite**: Fast development server and optimized production builds
- **Tailwind CSS**: Utility-first responsive styling
- **Shadcn/ui + Radix UI**: Accessible, composable UI components
- **Routing**: React Router with protected routes

### **Backend Architecture**
- **Convex**: Serverless backend providing real-time database and authentication
- **Document Database**: Schema-driven data modeling with indexing
- **Real-time Sync**: Live updates across all connected clients
- **Authentication**: Integrated user management with role-based access

### **Key Design Patterns**

#### **1. Component Composition Pattern**
```typescript
// Reusable card components with props
interface SummaryCardProps {
  title: string;
  value: number;
  formatAmount: (amount: number) => string;
  // ... other props
}

function SummaryCard({ title, value, formatAmount }: SummaryCardProps) {
  return (/* Card JSX */);
}
```

#### **2. Hook-Abstraction Pattern**
```typescript
// Custom hooks for business logic
function useCurrencyConversion() {
  const currencySettings = useQuery(api.currency.getCurrencySettings);
  const selectedCurrency = currencySettings?.selectedCurrency || "USD";

  const formatAmount = (amount: number) => {
    // Currency conversion logic
  };

  return { formatAmount, selectedCurrency };
}
```

#### **3. Provider Pattern**
```typescript
// Context for global state (currency, theme)
function TooltipProvider({ children }) {
  return <TooltipProviderLib> {children} </TooltipProviderLib>;
}
```

#### **4. Page-Component Pattern**
```typescript
// Each module has its own page component with full functionality
export default function SalesPage() {
  // State management, form handling, data display
  return (
    <Layout>
      <SalesTable />
      <AddEditDialog />
    </Layout>
  );
}
```

## Component Relationships

### **Core Component Hierarchy**
```
App (Root)
├── Layout (Navigation + Theme)
│   ├── Header (Logo + Currency Selector + User Menu)
│   └── Sidebar (Module Navigation)
│
├── Dashboard (Index Page)
│   ├── SummaryCards (Financial KPIs)
│   ├── ChartsSection (Visual Analytics)
│   └── RecentActivity (Transaction History)
│
├── Module Pages (9 Financial Modules)
│   ├── SalesPage (CRUD operations + analytics)
│   ├── ExpensesPage (CRUD operations + filtering)
│   ├── LiabilitiesPage (CRUD operations + due dates)
│   ├── CashflowPage (CRUD operations + trends)
│   ├── SalariesPage (CRUD operations + payroll)
│   ├── BankPdcPage (CRUD operations + cheque tracking)
│   ├── FuturesNeedsPage (CRUD operations + planning)
│   └── BusinessInHandPage (CRUD operations + pipeline)
│
└── AdminPage (Seeding + Data Management)
```

### **Shared Component Architecture**
```
UI Components (Shadcn/ui)
├── Buttons (Multiple variants)
├── Card (Container component)
├── Table (Data display)
├── Input/Select/Textarea (Form controls)
├── Dialog (Modals)
├── Badge (Status indicators)
└── Loading States

Utility Components
├── CurrencySelector (Global currency switching)
├── Layout (Page container with navigation)
├── ExportButton (Data export functionality)
└── DateFormatters (Consistent date display)
```

## Critical Implementation Paths

### **1. Dashboard Rendering**
```typescript
// Real-time dashboard updates
const dashboard = useQuery(api.dashboard.getDashboardData);
const summary = dashboard?.summary || {};
const charts = dashboard?.charts || [];

// Automatic re-render when data changes
<SummaryCards summary={summary} />
```

### **2. Currency Conversion Flow**
```typescript
// Real-time currency handling
const currencySettings = useQuery(api.currency.getCurrencySettings);
const selectedCurrency = currencySettings?.selectedCurrency || "USD";

// All amounts automatically convert based on selection
const convertedAmount = convertCurrency(100, "USD", selectedCurrency);
```

### **3. Form Data Handling**
```typescript
// Consistent CRUD pattern across modules
const [formData, setFormData] = useState(initialData);
const createMutation = useMutation(api.module.createRecord);
const updateMutation = useMutation(api.module.updateRecord);

// Standardized error handling
try {
  await createMutation(formData);
  toast.success("Record created");
} catch (error) {
  toast.error("Failed to create record");
}
```

### **4. Data Export Flow**
```typescript
// Consistent export pattern
function handleExport() {
  if (!data || data.length === 0) {
    toast.error("No data to export");
    return;
  }

  try {
    exportData(data, selectedCurrency);
    toast.success("Data exported successfully");
  } catch (error) {
    toast.error("Export failed");
  }
}
```

## Key Technical Decisions

### **1. Convex Database Choice**
- **Decision**: Use Convex for backend over traditional databases
- **Reasoning**: Real-time capabilities, type safety, serverless scalability
- **Impact**: Immediate data sync across all clients without complex WebSocket setup

### **2. Component-First Architecture**
- **Decision**: Build reusable components before features
- **Reasoning**: Ensures consistency and maintainability across 9 modules
- **Impact**: 70%+ code reusability, easier testing, consistent UX

### **3. Real-Time Data Pattern**
- **Decision**: Query-first approach with reactive updates
- **Reasoning**: Users need live financial data for decision making
- **Impact**: Users see changes instantly without refresh

### **4. Mobile-First Responsive Design**
- **Decision**: Build mobile-first with Tailwind breakpoints
- **Reasoning**: Business users access data on mobile devices
- **Impact**: Full functionality on smartphones and tablets

### **5. Type Safety Priority**
- **Decision**: Full TypeScript coverage across frontend
- **Reasoning**: Financial data requires accuracy and reliability
- **Impact**: Prevents runtime errors in financial calculations

## Database Schema Patterns

### **Standard CRUD Table Structure**
```typescript
// Consistent schema across modules
{
  _id: v.id("tableName"),
  _creationTime: v.number(),
  _updatedTime: v.number(),

  // Module-specific fields
  date: v.string(),
  description: v.string(),
  amount: v.number(),
  currency: v.string(),

  // Common patterns
  status: v.union(v.literal("paid"), v.literal("pending")),
  category: v.string()
}
```

### **Indexing Strategy**
```typescript
// Performance-critical indexes
index("by_date", ["date"]),
index("by_category", ["category"]),
index("by_status", ["status"])
```

### **Query Patterns**
```typescript
// Consistent data fetching
export const getAllRecords = query({
  args: {},
  returns: v.array(v.object({ /* schema */ })),
  handler: async (ctx) => {
    return await ctx.db.query("tableName").collect();
  },
});
```

## State Management Patterns

### **Server State (Convex)**
- Queries for server data fetching
- Mutations for data updates
- Automatic cache invalidation and re-fetching
- Real-time subscriptions

### **Client State (React)**
- Component-level state for forms and UI
- Custom hooks for complex logic
- Context for global settings (currency, theme)

### **Frontend-Backend Sync Pattern**
```typescript
// Optimistic updates with error rollback
const addRecordMutation = useMutation(api.module.addRecord);

const handleSubmit = async (data) => {
  try {
    await addRecordMutation(data);
    // Success: Automatic UI update via Convex subscription
  } catch (error) {
    // Error: Manual error state handling
    setError("Failed to save record");
  }
};
```

## Security Patterns

### **Authentication Flow**
- Convex Auth handles user sessions
- Protected routes check user authentication
- Role-based UI rendering

### **Data Validation**
- Schema validation at database level
- Form validation before submission
- TypeScript prevents type mismatches

### **Safe Operations**
- Confirmation dialogs for destructive actions
- Optimistic updates with error rollback
- Input sanitization preventing malicious data

## Performance Optimization Patterns

### **Component Memoization**
```typescript
const SummaryCard = memo(function SummaryCard({ value, title }) {
  return (/* Card JSX */);
});
```

### **Query Efficiency**
- Pagination for large datasets
- Selective queries for specific modules
- Debounced search inputs

### **Bundle Optimization**
- Lazy loading for route components
- Tree-shaking unused utilities
- Optimized image assets

## Testing Patterns

### **Component Testing Architecture**
- Unit tests for business logic functions
- Integration tests for component interactions
- E2E tests for critical user flows
- Visual regression testing for UI consistency

### **Data Testing Strategy**
- Schema validation testing
- Mutation outcome verification
- Query result accuracy testing
- Export functionality validation
