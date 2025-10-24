import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Layout } from "@/components/layout";
import { CurrencySelector } from "@/components/currency-selector";
import { toast } from "sonner";
import { useCurrencyConversion } from "@/hooks/use-currency-conversion";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

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
            <CurrencySelector />
          </div>
        </div>

        <SummaryCards summary={summary} formatAmount={formatAmount} selectedCurrency={selectedCurrency} />

        <ChartsSection charts={charts} formatAmount={formatAmount} />

        <RecentActivity activities={recentActivity} formatAmount={formatAmount} selectedCurrency={selectedCurrency} />

      </div>
    </Layout>
  );
}
