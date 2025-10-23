import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// This is a temporary action to seed the database with sample data
export const seedDatabase = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Sample sales data
    const salesData = [
      {
        date: "2024-01-15",
        description: "Website Development Project",
        cost: 5000,
        sellingPrice: 12000,
        expenses: 1000,
        currency: "USD",
      },
      {
        date: "2024-01-20",
        description: "Mobile App Development",
        cost: 8000,
        sellingPrice: 18000,
        expenses: 1500,
        currency: "USD",
      },
      {
        date: "2024-02-05",
        description: "E-commerce Platform",
        cost: 15000,
        sellingPrice: 35000,
        expenses: 3000,
        currency: "USD",
      },
    ];

    for (const sale of salesData) {
      await ctx.runMutation(api.sales.createSale, sale);
    }

    // Sample expenses data
    const expensesData = [
      {
        date: "2024-01-10",
        category: "Office Supplies",
        description: "Laptops and equipment",
        vendor: "Tech Store Inc",
        amount: 2500,
        status: "paid" as const,
        currency: "USD",
      },
      {
        date: "2024-01-25",
        category: "Marketing",
        description: "Google Ads campaign",
        vendor: "Google",
        amount: 800,
        status: "paid" as const,
        currency: "USD",
      },
      {
        date: "2024-02-01",
        category: "Utilities",
        description: "Office rent and utilities",
        vendor: "Property Management Co",
        amount: 1200,
        status: "unpaid" as const,
        currency: "USD",
      },
    ];

    for (const expense of expensesData) {
      await ctx.runMutation(api.expenses.createExpense, expense);
    }

    // Sample liabilities data
    const liabilitiesData = [
      {
        lenderParty: "Business Bank",
        liabilityType: "Business Loan",
        startDate: "2024-01-01",
        dueDate: "2025-01-01",
        originalAmount: 50000,
        outstandingBalance: 35000,
        currency: "USD",
        description: "Equipment financing loan",
      },
      {
        lenderParty: "Supplier ABC",
        liabilityType: "Trade Credit",
        startDate: "2024-01-15",
        dueDate: "2024-03-15",
        originalAmount: 5000,
        outstandingBalance: 5000,
        currency: "USD",
        description: "Raw materials purchase",
      },
    ];

    for (const liability of liabilitiesData) {
      await ctx.runMutation(api.liabilities.createLiability, liability);
    }

    // Sample salaries data
    const salariesData = [
      {
        employeeName: "John Smith",
        role: "Software Developer",
        netSalary: 5000,
        paymentStatus: "paid" as const,
        paymentDate: "2024-01-31",
        month: "2024-01",
        currency: "USD",
      },
      {
        employeeName: "Sarah Johnson",
        role: "Project Manager",
        netSalary: 6000,
        paymentStatus: "paid" as const,
        paymentDate: "2024-01-31",
        month: "2024-01",
        currency: "USD",
      },
      {
        employeeName: "Mike Wilson",
        role: "Designer",
        netSalary: 4500,
        paymentStatus: "pending" as const,
        month: "2024-02",
        currency: "USD",
      },
    ];

    for (const salary of salariesData) {
      await ctx.runMutation(api.salaries.createSalary, salary);
    }

    // Sample business in hand data
    const businessInHandData = [
      {
        type: "po_in_hand" as const,
        description: "Enterprise Software Project",
        amount: 75000,
        expectedDate: "2024-03-15",
        currency: "USD",
        status: "confirmed" as const,
      },
      {
        type: "pending_invoice" as const,
        description: "Consulting Services - Q1",
        amount: 25000,
        expectedDate: "2024-02-28",
        currency: "USD",
        status: "pending" as const,
      },
    ];

    for (const business of businessInHandData) {
      await ctx.runMutation(api.businessInHand.createBusinessInHand, business);
    }

    // Sample Bank PDC data
    const bankPdcData = [
      {
        code: "PDC-001",
        date: "2024-03-15",
        description: "Payment for office supplies",
        amount: 5000,
        status: "pending" as const,
        bank: "Emirates NBD",
        chequeNumber: "123456",
        supplier: "Office Supplies Co",
        creationDate: "2024-01-15",
        currency: "AED",
      },
      {
        code: "PDC-002",
        date: "2024-04-01",
        description: "Equipment purchase payment",
        amount: 12000,
        status: "cleared" as const,
        bank: "ADCB",
        chequeNumber: "789012",
        supplier: "Tech Equipment Ltd",
        creationDate: "2024-01-20",
        currency: "AED",
      },
    ];

    for (const pdc of bankPdcData) {
      await ctx.runMutation(api.bankPdc.createBankPdc, pdc);
    }

    // Sample Future Needs data
    const futureNeedsData = [
      {
        description: "Office expansion furniture",
        amount: 2500,
        quantity: 10,
        month: "2024-04",
        status: "one-time" as const,
        currency: "USD",
        remarks: "New desks and chairs for expanded team",
      },
      {
        description: "Software licenses renewal",
        amount: 500,
        quantity: 1,
        month: "2024-03",
        status: "recurring" as const,
        currency: "USD",
        remarks: "Annual subscription renewals",
      },
    ];

    for (const need of futureNeedsData) {
      await ctx.runMutation(api.futureNeeds.createFutureNeed, need);
    }

    console.log("Sample data seeded successfully!");
    return null;
  },
});