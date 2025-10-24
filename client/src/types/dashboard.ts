// Dashboard-related type definitions for the FinanceTracker application

// Chart data structures (used by recharts)
export interface ChartDataPoint {
  name: string;
  value: number;
  amount?: number;
  percentage?: number;
}

export interface CashFlowDataPoint {
  month: string;
  inflows: number;
  outflows: number;
  netCashflow: number;
}

export interface SalesDataPoint {
  month: string;
  sales: number;
  profit: number;
}

export interface CategoryDataPoint {
  category: string;
  amount: number;
  percentage: number;
}

export interface LiabilitiesDataPoint {
  month: string;
  amount: number;
}

// Dashboard chart structures
export interface DashboardCharts {
  cashflowTrend: CashFlowDataPoint[];
  expensesByCategory: CategoryDataPoint[];
  salesTrend: SalesDataPoint[];
  liabilitiesByDueDate: LiabilitiesDataPoint[];
}

// Recent activity item
export interface RecentActivityItem {
  type: string;
  description: string;
  amount: number;
  date: string;
  currency: string;
}

// Summary data interface
export interface DashboardSummary {
  totalSales: number;
  totalExpenses: number;
  outstandingLiabilities: number;
  salariesPaid: number;
  salariesPending: number;
  totalProfit: number;
  businessInHandValue: number;
  totalInflows: number;
  totalOutflows: number;
  netCashflow: number;
}

// Complete dashboard data interface
export interface DashboardData {
  charts: DashboardCharts;
  recentActivity: RecentActivityItem[];
  summary: DashboardSummary;
}

// Currency conversion data
export interface ConvertedData {
  summary: DashboardSummary;
  convertedData: Record<string, any>; // Additional converted data if needed
}

// API response types
export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}
