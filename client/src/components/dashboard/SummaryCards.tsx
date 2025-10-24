import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Briefcase,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  Users
} from "lucide-react";
import { DashboardSummary } from "@/types/dashboard";

interface SummaryCardsProps {
  summary: DashboardSummary;
  formatAmount: (amount: number) => string;
  selectedCurrency: string;
}

export function SummaryCards({ summary, formatAmount, selectedCurrency }: SummaryCardsProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards - First Row (5 cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Sales</CardTitle>
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
            <CardTitle className="text-sm font-medium text-blue-900">Total Expenses</CardTitle>
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
            <CardTitle className="text-sm font-medium text-blue-900">Outstanding Liabilities</CardTitle>
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
            <CardTitle className="text-sm font-medium text-blue-900">Salary Status</CardTitle>
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
            <CardTitle className="text-sm font-medium text-blue-900">Net Cash Flow</CardTitle>
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
            <CardTitle className="text-sm font-medium text-blue-900">Total Profit</CardTitle>
            {(summary.totalProfit || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${(summary.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            <CardTitle className="text-sm font-medium text-blue-900">Pending Salaries</CardTitle>
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
            <CardTitle className="text-sm font-medium text-blue-900">Business in Hand</CardTitle>
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
            <CardTitle className="text-sm font-medium text-blue-900">Cash Flow Ratio</CardTitle>
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
    </div>
  );
}
