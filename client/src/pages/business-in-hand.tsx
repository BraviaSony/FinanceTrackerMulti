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
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Briefcase, FileText, DollarSign, Clock, CheckCircle , Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency, convertCurrency, type Currency } from "@/lib/currency-utils";
import { useCurrencyConversion } from "@/hooks/use-currency-conversion";
import { exportBusinessInHandData } from "@/lib/excel-export";

interface BusinessInHandFormData {
  type: "po_in_hand" | "pending_invoice" | "expected_revenue";
  description: string;
  amount: number;
  expectedDate: string;
  status: "pending" | "confirmed" | "received";
  currency: string;
}

const initialFormData: BusinessInHandFormData = {
  type: "po_in_hand",
  description: "",
  amount: 0,
  expectedDate: "",
  status: "pending",
  currency: "USD",
};

export default function BusinessInHandPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [formData, setFormData] = useState<BusinessInHandFormData>(initialFormData);

  // Queries
  const allBusiness = useQuery(api.businessInHand.getAllBusinessInHand);
  const businessSummary = useQuery(api.businessInHand.getBusinessInHandSummary, {});

  // Mutations
  const createBusiness = useMutation(api.businessInHand.createBusinessInHand);
  const updateBusiness = useMutation(api.businessInHand.updateBusinessInHand);
  const deleteBusiness = useMutation(api.businessInHand.deleteBusinessInHand);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBusiness) {
        await updateBusiness({
          id: editingBusiness._id,
          type: formData.type,
          description: formData.description,
          amount: formData.amount,
          expectedDate: formData.expectedDate,
          status: formData.status,
          currency: formData.currency,
        });
        toast.success("Business record updated successfully");
      } else {
        await createBusiness(formData);
        toast.success("Business record created successfully");
      }
      
      setIsDialogOpen(false);
      setEditingBusiness(null);
      setFormData(initialFormData);
    } catch (error) {
      toast.error("Failed to save business record");
    }
  };

  const handleEdit = (business: any) => {
    setEditingBusiness(business);
    setFormData({
      type: business.type,
      description: business.description,
      amount: business.amount,
      expectedDate: business.expectedDate,
      status: business.status,
      currency: business.currency,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to delete this business record?")) {
      try {
        await deleteBusiness({ id });
        toast.success("Business record deleted successfully");
      } catch (error) {
        toast.error("Failed to delete business record");
      }
    }
  };

  const handleExport = () => {
    if (!allBusiness || allBusiness.length === 0) {
      toast.error("No business in hand data to export");
      return;
    }

    try {
      exportBusinessInHandData(allBusiness, selectedCurrency);
      toast.success("Business in hand data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export business in hand data");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "po_in_hand":
        return <FileText className="w-4 h-4" />;
      case "pending_invoice":
        return <DollarSign className="w-4 h-4" />;
      case "expected_revenue":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      po_in_hand: "PO in Hand",
      pending_invoice: "Pending Invoice",
      expected_revenue: "Expected Revenue",
    };
    
    return (
      <Badge variant="outline">
        {getTypeIcon(type)}
        <span className="ml-1">{typeLabels[type as keyof typeof typeLabels]}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      confirmed: { variant: "default" as const, icon: CheckCircle, color: "text-blue-600" },
      received: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const { selectedCurrency, formatAmount } = useCurrencyConversion();


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Business in Hand</h1>
            <p className="text-muted-foreground">
              Track your business pipeline, pending invoices, and expected revenue
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingBusiness(null);
                setFormData(initialFormData);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Business Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingBusiness ? "Edit Business Record" : "Add New Business Record"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: "po_in_hand" | "pending_invoice" | "expected_revenue") => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="po_in_hand">PO in Hand</SelectItem>
                        <SelectItem value="pending_invoice">Pending Invoice</SelectItem>
                        <SelectItem value="expected_revenue">Expected Revenue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: "pending" | "confirmed" | "received") => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
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
                    placeholder="Enterprise software development project"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
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
                  <div className="space-y-2">
                    <Label htmlFor="expectedDate">Expected Date</Label>
                    <Input
                      id="expectedDate"
                      type="date"
                      value={formData.expectedDate}
                      onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBusiness ? "Update Record" : "Create Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        {businessSummary && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{businessSummary.totalCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                    {formatAmount(businessSummary.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed Value</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                    {formatAmount(businessSummary.confirmedAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Received Value</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                    {formatAmount(businessSummary.receivedAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}



        {/* Business Records Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Business Records</CardTitle>
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
            {!allBusiness ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : allBusiness.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No business records found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start tracking by adding your first business record.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Expected Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBusiness.map((business) => (
                    <TableRow key={business._id}>
                      <TableCell>{getTypeBadge(business.type)}</TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate">{business.description}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <span className={selectedCurrency === 'SAR' ? 'sar-symbol' : ''}>
                          {formatCurrency(convertCurrency(business.amount, business.currency as Currency, selectedCurrency), selectedCurrency)}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(business.expectedDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(business.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(business)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(business._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
