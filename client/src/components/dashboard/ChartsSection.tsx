import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { DashboardCharts } from "@/types/dashboard";

// Magic numbers extracted to constants for better maintainability
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface ChartsSectionProps {
  charts: DashboardCharts;
  formatAmount: (amount: number) => string;
}

export function ChartsSection({ charts, formatAmount }: ChartsSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Cash Flow Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Cash Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.cashflowTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatAmount(Number(value))} />
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
          <CardTitle className="text-blue-900">Expenses by Category</CardTitle>
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
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatAmount(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Sales & Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatAmount(Number(value))} />
              <Bar dataKey="sales" fill="#0088FE" name="Sales" />
              <Bar dataKey="profit" fill="#00C49F" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Liabilities by Due Date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Liabilities by Due Date</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.liabilitiesByDueDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatAmount(Number(value))} />
              <Bar dataKey="amount" fill="#FF8042" name="Amount Due" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
