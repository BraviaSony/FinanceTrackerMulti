import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivityItem } from "@/types/dashboard";

interface RecentActivityProps {
  activities: RecentActivityItem[];
  formatAmount: (amount: number) => string;
  selectedCurrency: string;
}

export function RecentActivity({ activities, formatAmount, selectedCurrency }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity, index) => (
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
  );
}
