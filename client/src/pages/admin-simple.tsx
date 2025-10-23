import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Loader2, Trash2, Trash } from "lucide-react";
import { toast } from "sonner";

export default function AdminSimplePage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const seedDatabase = useAction(api.seedData.seedDatabase);
  const removeSeededData = useAction(api.seedData.removeSeededData);
  const clearAllData = useAction(api.seedData.clearAllData);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      toast.success("Sample data has been added to the database!");
    } catch (error) {
      toast.error("Failed to seed database");
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRemoveSeededData = async () => {
    setIsRemoving(true);
    try {
      await removeSeededData();
      toast.success("Sample data has been removed from the database!");
    } catch (error) {
      toast.error("Failed to remove sample data");
      console.error(error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm("⚠️ WARNING: This will delete ALL data from the database, including any data you manually added. This action cannot be undone. Are you sure?")) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAllData();
      toast.success("All data has been cleared from the database!");
    } catch (error) {
      toast.error("Failed to clear all data");
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Administrative tools and database management
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Database Management - Available for development */}
          {true && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage sample data for testing. Add comprehensive test data or remove only the seeded sample data while preserving user-added records.
                </p>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleSeedDatabase}
                      disabled={isSeeding || isRemoving || isClearing}
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      {isSeeding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4" />
                      )}
                      {isSeeding ? "Adding..." : "Add Sample Data"}
                    </Button>
                    <Button
                      onClick={handleRemoveSeededData}
                      disabled={isSeeding || isRemoving || isClearing}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      {isRemoving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {isRemoving ? "Removing..." : "Remove Sample Data"}
                    </Button>
                  </div>
                  <Button
                    onClick={handleClearAllData}
                    disabled={isSeeding || isRemoving || isClearing}
                    variant="outline"
                    className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {isClearing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                    {isClearing ? "Clearing..." : "Clear ALL Data (DANGER!)"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Remove only removes data added by "Add Sample Data". Your manual entries are safe.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Environment:</span>
                <span className="text-sm font-medium">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Database:</span>
                <span className="text-sm font-medium">Convex</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Version:</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
