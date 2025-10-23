import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, DollarSign, AlertTriangle, CreditCard, Banknote, Download } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency, convertCurrency, type Currency } from "@/lib/currency-utils";
import { useCurrencyConversion } from "@/hooks/use-currency-conversion";
import { exportLiabilitiesData } from "@/lib/excel-export";

interface LiabilityFormData {
  lenderParty: string;
  liabilityType: string;
  description: string;
  startDate: string;
  dueDate: string;
  originalAmount: number;
  currency: string;
}

const initialFormData: LiabilityFormData = {
  lenderParty: "",
  liabilityType: "",
  description: "",
  startDate: new Date().toISOString().split('T')[0],
  dueDate: "",
  originalAmount: 0,
  currency: "USD",
};

export default function LiabilitiesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Id<"liabilities"> | null>(null);
  const [paymentLiability, setPaymentLiability] = useState<Id<"liabilities"> | null>(null);
  const [formData, setFormData] = useState<LiabilityFormData>(initialFormData);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const liabilities = useQuery(api.liabilities.getAllLiabilities);
  const liabilitySummary = useQuery(api.liabilities.getLiabilitiesSummary, {});
  
  const createLiability = useMutation(api.liabilities.createLiability);
  const updateLiability = useMutation(api.liabilities.updateLiability);
  const deleteLiability = useMutation(api.liabilities.deleteLiability);
  const makePayment = useMutation(api.liabilities.makePayment);

  const { selectedCurrency, formatAmount } = useCurrencyConversion();

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  const getDueDateBadge = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (days <= 7) {
      return <Badge variant="secondary">Due Soon</Badge>;
    } else {
      return <Badge variant="outline">{days} days</Badge>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLiability) {
        await updateLiability({
          id: editingLiability,
          ...formData,
        });
        toast.success("Liability updated successfully");
      } else {
        await createLiability(formData);
        toast.success("Liability created successfully");
      }
      
      setIsDialogOpen(false);
      setEditingLiability(null);
      setFormData(initialFormData);
    } catch (error) {
      toast.error("Failed to save liability");
      console.error(error);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentLiability) return;
    
    try {
      await makePayment({
        id: paymentLiability,
        paymentAmount: paymentAmount,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      toast.success("Payment recorded successfully");
      setIsPaymentDialogOpen(false);
      setPaymentLiability(null);
      setPaymentAmount(0);
    } catch (error) {
      toast.error("Failed to record payment");
      console.error(error);
    }
  };

  const handleEdit = (liability: any) => {
    setEditingLiability(liability._id);
    setFormData({
      lenderParty: liability.lenderParty,
      liabilityType: liability.liabilityType,
      description: liability.description || "",
      startDate: liability.startDate,
      dueDate: liability.dueDate,
      originalAmount: liability.originalAmount,
      currency: liability.currency,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: Id<"liabilities">) => {
    if (window.confirm("Are you sure you want to delete this liability?")) {
      try {
        await deleteLiability({ id });
        toast.success("Liability deleted successfully");
      } catch (error) {
        toast.error("Failed to delete liability");
        console.error(error);
      }
    }
  };

  const handleExport = () => {
    if (!liabilities || liabilities.length === 0) {
      toast.error("No liabilities data to export");
      return;
    }

    try {
      // Transform data to match export format
      const exportData = liabilities.map(liability => ({
        ...liability,
        startDate: liability.startDate,
        endDate: liability.dueDate, // Use dueDate as endDate
        amount: liability.originalAmount, // Use originalAmount as amount
        recurringAmount: liability.outstandingBalance, // Use outstandingBalance as recurringAmount
      }));
      exportLiabilitiesData(exportData, selectedCurrency);
      toast.success("Liabilities data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export liabilities data");
    }
  };

  const handleAddNew = () => {
    setEditingLiability(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleMakePayment = (liability: any) => {
    setPaymentLiability(liability._id);
    setPaymentAmount(liability.outstandingBalance);
    setIsPaymentDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Liabilities</h1>
            <p className="text-muted-foreground">
              Track and manage your business liabilities and debts
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Liability
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingLiability ? "Edit Liability" : "Add New Liability"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="liabilityType">Type</Label>
                    <Input
                      id="liabilityType"
                      value={formData.liabilityType}
                      onChange={(e) => setFormData({ ...formData, liabilityType: e.target.value })}
                      placeholder="e.g., Loan, Credit Card, Invoice"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="SAR">SAR</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the liability"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lenderParty">Lender/Creditor</Label>
                  <Input
                    id="lenderParty"
                    value={formData.lenderParty}
                    onChange={(e) => setFormData({ ...formData, lenderParty: e.target.value })}
                    placeholder="Creditor or lender name"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalAmount">Original Amount</Label>
                    <Input
                      id="originalAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.originalAmount}
                      onChange={(e) => setFormData({ ...formData, originalAmount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingLiability ? "Update" : "Create"} Liability
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Record Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Summary Cards */}
        {liabilitySummary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                    {formatAmount(liabilitySummary.totalOriginalAmount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {liabilitySummary.liabilityCount} liabilit{liabilitySummary.liabilityCount !== 1 ? 'ies' : 'y'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <CreditCard className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-red-600">
                  <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                    {formatAmount(liabilitySummary.totalOutstandingBalance)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Amount owed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                <Banknote className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-green-600">
                  <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                    {formatAmount(liabilitySummary.totalPaidAmount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total paid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-red-600">{liabilitySummary.overdueLiabilities}</div>
                <p className="text-xs text-muted-foreground">
                  Past due date
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Liabilities Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liability Records</CardTitle>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!liabilities ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : liabilities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No liability records found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Add Liability" to create your first liability record
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Lender</TableHead>
                      <TableHead className="text-right">Original Amount</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liabilities.map((liability) => (
                      <TableRow key={liability._id}>
                        <TableCell>
                          <Badge variant="outline">{liability.liabilityType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{liability.description || "No description"}</TableCell>
                        <TableCell>{liability.lenderParty}</TableCell>
                        <TableCell className="text-right">
                          <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                            {formatCurrency(convertCurrency(liability.originalAmount, liability.currency as Currency, selectedCurrency), selectedCurrency)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={liability.outstandingBalance > 0 ? "text-red-600" : "text-green-600"}>
                            <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                              {formatCurrency(convertCurrency(liability.outstandingBalance, liability.currency as Currency, selectedCurrency), selectedCurrency)}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{format(new Date(liability.dueDate), 'MMM dd, yyyy')}</span>
                            {getDueDateBadge(liability.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {liability.outstandingBalance > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMakePayment(liability)}
                              >
                                <Banknote className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(liability)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(liability._id)}
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
