import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Layout } from "@/components/layout";
import { CurrencySelector } from "@/components/currency-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCurrencyConversion } from "@/hooks/use-currency-conversion";

import { 
  BarChart3, 
  Receipt, 
  CreditCard, 
  Users, 
  TrendingUp,
  TrendingDown,
  Briefcase
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const seedDatabase = useAction(api.seedData.seedDatabase);
  const dashboardData = useQuery(api.dashboard.getDashboardData, {});
  const { convertedData, formatAmount, selectedCurrency } = useCurrencyConversion();

  // Enhanced formatAmount function for dashboard with custom font support
  const formatAmountWithCustomFont = (amount: number) => {
    return formatAmount(amount); // Already includes useCustomFont: true
  };

  const handleSeedDatabase = async () => {
    try {
      toast.info("Seeding database with sample data...");
      await seedDatabase();
      toast.success("Sample data added successfully!");
    } catch (error) {
      toast.error("Failed to seed database");
      console.error(error);
    }
  };

  if (!dashboardData || !convertedData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const { charts, recentActivity } = dashboardData;
  const { summary } = convertedData;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your financial performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Hidden for production - keep code for development */}
            {false && (
              <Button onClick={handleSeedDatabase} variant="outline">
                Add Sample Data
              </Button>
            )}
            <CurrencySelector />
          </div>
        </div>

        {/* Summary Cards - First Row (5 cards) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                  {formatAmount(summary.totalSales)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Total revenue generated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                  {formatAmount(summary.totalExpenses)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Current period expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Liabilities</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                  {formatAmount(summary.outstandingLiabilities)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Total amount due
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salary Status</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                  {formatAmount(summary.salariesPaid)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Paid: <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>{formatAmount(summary.salariesPaid)}</span> | Pending: <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>{formatAmount(summary.salariesPending)}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              {summary.netCashflow >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-semibold ${summary.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                  {formatAmount(summary.netCashflow)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                In: <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>{formatAmount(summary.totalInflows)}</span> | Out: <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>{formatAmount(summary.totalOutflows)}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Summary Cards - Second Row (4 cards) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                  {formatAmount(summary.totalProfit || 0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Total profit generated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Salaries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                  {formatAmount(summary.salariesPending)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Salaries awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business in Hand</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                  {formatAmount(summary.businessInHandValue)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Expected revenue pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Flow Ratio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {summary.totalOutflows > 0 ? (summary.totalInflows / summary.totalOutflows).toFixed(2) : "∞"}
              </div>
              <p className="text-xs text-muted-foreground">
                Inflow to outflow ratio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Cash Flow Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.cashflowTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmountWithCustomFont(Number(value))} />
                  <Line type="monotone" dataKey="inflows" stroke="#00C49F" strokeWidth={2} name="Inflows" />
                  <Line type="monotone" dataKey="outflows" stroke="#FF8042" strokeWidth={2} name="Outflows" />
                  <Line type="monotone" dataKey="netCashflow" stroke="#0088FE" strokeWidth={2} name="Net Cash Flow" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {charts.expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmountWithCustomFont(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Sales & Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmountWithCustomFont(Number(value))} />
                  <Bar dataKey="sales" fill="#0088FE" name="Sales" />
                  <Bar dataKey="profit" fill="#00C49F" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Liabilities by Due Date */}
          <Card>
            <CardHeader>
              <CardTitle>Liabilities by Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.liabilitiesByDueDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmountWithCustomFont(Number(value))} />
                  <Bar dataKey="amount" fill="#FF8042" name="Amount Due" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'Sale' ? 'bg-green-500' : 
                        activity.type === 'Expense' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                          {formatAmount(activity.amount)}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
