import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Layout } from "@/components/layout";
import { CurrencySelector } from "@/components/currency-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, TrendingUp, BarChart3, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { convertCurrency, formatCurrency, type Currency } from "@/lib/currency-utils";
import { exportSalesData } from "@/lib/excel-export";

export default function SalesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    cost: "",
    sellingPrice: "",
    currency: "USD",
  });

  const sales = useQuery(api.sales.getAllSales);
  const currencySettings = useQuery(api.currency.getCurrencySettings);
  
  const createSale = useMutation(api.sales.createSale);
  const updateSale = useMutation(api.sales.updateSale);
  const deleteSale = useMutation(api.sales.deleteSale);

  const selectedCurrency = (currencySettings?.selectedCurrency || "USD") as Currency;

  // Removed unused formatAmount function

  const formatConvertedAmount = (amount: number, originalCurrency: Currency) => {
    const convertedAmount = convertCurrency(amount, originalCurrency, selectedCurrency);
    return formatCurrency(convertedAmount, selectedCurrency, { useCustomFont: true });
  };

  // Calculate sales summary with currency conversion
  
  const salesSummary = sales && sales.length > 0 ? {
    totalSales: sales.reduce((sum, sale) => {
      const converted = convertCurrency(sale.sellingPrice || 0, sale.currency as Currency, selectedCurrency);
      return sum + (isNaN(converted) ? 0 : converted);
    }, 0),
    totalGrossProfit: sales.reduce((sum, sale) => {
      const converted = convertCurrency(sale.grossProfit || 0, sale.currency as Currency, selectedCurrency);
      return sum + (isNaN(converted) ? 0 : converted);
    }, 0),
    totalNetProfit: sales.reduce((sum, sale) => {
      const converted = convertCurrency(sale.netProfit || 0, sale.currency as Currency, selectedCurrency);
      return sum + (isNaN(converted) ? 0 : converted);
    }, 0),
    totalCost: sales.reduce((sum, sale) => {
      const converted = convertCurrency(sale.cost || 0, sale.currency as Currency, selectedCurrency);
      return sum + (isNaN(converted) ? 0 : converted);
    }, 0),
    salesCount: sales.length,
    averageGrossMargin: sales.length > 0 ? sales.reduce((sum, sale) => sum + (sale.grossProfitMargin || 0), 0) / sales.length : 0,
    averageNetMargin: sales.length > 0 ? sales.reduce((sum, sale) => sum + (sale.netProfitMargin || 0), 0) / sales.length : 0,
  } : {
    totalSales: 0,
    totalGrossProfit: 0,
    totalNetProfit: 0,
    totalCost: 0,
    salesCount: 0,
    averageGrossMargin: 0,
    averageNetMargin: 0,
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      cost: "",
      sellingPrice: "",
      currency: selectedCurrency,
    });
    setEditingSale(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        date: formData.date,
        description: formData.description,
        cost: parseFloat(formData.cost),
        sellingPrice: parseFloat(formData.sellingPrice),
        expenses: 0, // Set expenses to 0 since we removed the field
        currency: formData.currency,
      };

      if (editingSale) {
        await updateSale({
          id: editingSale._id,
          ...data,
        });
        toast.success("Sale updated successfully");
      } else {
        await createSale(data);
        toast.success("Sale created successfully");
      }

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save sale");
    }
  };

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    setFormData({
      date: sale.date,
      description: sale.description,
      cost: sale.cost.toString(),
      sellingPrice: sale.sellingPrice.toString(),
      currency: sale.currency,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await deleteSale({ id: id as any });
        toast.success("Sale deleted successfully");
      } catch (error) {
        toast.error("Failed to delete sale");
      }
    }
  };

  const handleExport = () => {
    if (!sales || sales.length === 0) {
      toast.error("No sales data to export");
      return;
    }

    try {
      exportSalesData(sales, selectedCurrency);
      toast.success("Sales data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export sales data");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Sales Management</h1>
            <p className="text-muted-foreground">
              Track sales transactions and profit calculations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <CurrencySelector />
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingSale ? "Edit Sale" : "Add New Sale"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="SAR">SAR (ê)</option>
                        <option value="AED">AED (د.إ)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Sale description..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cost">Cost</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sellingPrice">Selling Price</Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        step="0.01"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="grossMargin">Gross Margin %</Label>
                      <Input
                        id="grossMargin"
                        type="text"
                        value={
                          formData.cost && formData.sellingPrice && parseFloat(formData.sellingPrice) > 0
                            ? ((parseFloat(formData.sellingPrice) - parseFloat(formData.cost)) / parseFloat(formData.sellingPrice) * 100).toFixed(2) + '%'
                            : '0.00%'
                        }
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  {/* Profit Preview */}
                  {formData.cost && formData.sellingPrice && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <h4 className="font-medium">Profit Preview</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Gross Profit:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(parseFloat(formData.sellingPrice) - parseFloat(formData.cost), formData.currency as Currency, { useCustomFont: true })}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">GP Margin:</span>
                          <span className="ml-2 font-medium">
                            {parseFloat(formData.sellingPrice) > 0 
                              ? ((parseFloat(formData.sellingPrice) - parseFloat(formData.cost)) / parseFloat(formData.sellingPrice) * 100).toFixed(2)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSale ? "Update Sale" : "Create Sale"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {salesSummary ? (
                  <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                    {formatCurrency(salesSummary.totalSales || 0, selectedCurrency, { useCustomFont: true })}
                  </span>
                ) : (
                  <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                    {formatCurrency(0, selectedCurrency, { useCustomFont: true })}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {salesSummary ? salesSummary.salesCount : 0} transactions
              </p>
            </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {salesSummary ? (
                    <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                      {formatCurrency(salesSummary.totalGrossProfit || 0, selectedCurrency, { useCustomFont: true })}
                    </span>
                  ) : (
                    <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                      {formatCurrency(0, selectedCurrency, { useCustomFont: true })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {salesSummary ? salesSummary.averageGrossMargin.toFixed(2) : "0.00"}% avg margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {salesSummary ? (
                    <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                      {formatCurrency(salesSummary.totalNetProfit || 0, selectedCurrency, { useCustomFont: true })}
                    </span>
                  ) : (
                    <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                      {formatCurrency(0, selectedCurrency, { useCustomFont: true })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {salesSummary ? salesSummary.averageNetMargin.toFixed(2) : "0.00"}% avg margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {salesSummary ? (
                    <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                      {formatCurrency(salesSummary.totalCost || 0, selectedCurrency, { useCustomFont: true })}
                    </span>
                  ) : (
                    <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                      {formatCurrency(0, selectedCurrency, { useCustomFont: true })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cost of goods sold
                </p>
              </CardContent>
            </Card>
          </div>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Records</CardTitle>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={!sales || sales.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!sales ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No sales records found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Add Sale" to create your first sale record
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                      <TableHead className="text-right">Gross Profit</TableHead>
                      <TableHead className="text-right">GP %</TableHead>
                      <TableHead className="text-right">Net Profit</TableHead>
                      <TableHead className="text-right">NP %</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale._id}>
                        <TableCell>{format(new Date(sale.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{sale.description}</TableCell>
                        <TableCell className="text-right">
                          <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                            {formatConvertedAmount(sale.cost, sale.currency as Currency)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                            {formatConvertedAmount(sale.sellingPrice, sale.currency as Currency)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={sale.grossProfit >= 0 ? "text-green-600" : "text-red-600"}>
                            <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                              {formatConvertedAmount(sale.grossProfit, sale.currency as Currency)}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={sale.grossProfitMargin >= 0 ? "default" : "destructive"}>
                            {sale.grossProfitMargin.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={sale.netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                            <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                              {formatConvertedAmount(sale.netProfit, sale.currency as Currency)}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={sale.netProfitMargin >= 0 ? "default" : "destructive"}>
                            {sale.netProfitMargin.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{sale.currency}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(sale)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(sale._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
