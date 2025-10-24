import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Mark the start of a seeding session
export const markSeedingSession = mutation({
  args: {
    startTime: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existingSession = await ctx.db
      .query("seedingSessions")
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (existingSession) {
      await ctx.db.patch(existingSession._id, {
        startTime: args.startTime,
        active: true,
      });
    } else {
      await ctx.db.insert("seedingSessions", {
        startTime: args.startTime,
        active: true,
      });
    }

    return null;
  },
});

// Remove only the sample data that was added by seedDatabase
export const removeSeededData = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    console.log("Starting removal of seeded sample data...");

    let totalRemoved = 0;

    // Remove all data with [SEED] markers from all tables regardless of session
    const removeDataWithSeedMarker = async (tableName: string, getAllFn: any, deleteFn: any) => {
      try {
        const allData = await ctx.runQuery(getAllFn);
        const seededData = allData.filter((item: any) =>
          (item.description?.includes("[SEED]") ||
           item.comment?.includes("[SEED]") ||
           item.employeeName?.includes("[SEED]") ||
           item.lenderParty?.includes("[SEED]") ||
           item.supplier?.includes("[SEED]") ||
           item.vendor?.includes("[SEED]") ||
           item.bank?.includes("[SEED]") ||
           item.category?.includes("[SEED]"))
        );

        for (const item of seededData) {
          try {
            await ctx.runMutation(deleteFn, { id: item._id });
            totalRemoved++;
          } catch (error) {
            console.log(`Error deleting ${tableName} item ${item._id}:`, error);
          }
        }

        console.log(`Removed ${seededData.length} seeded records from ${tableName}`);
      } catch (error) {
        console.log(`Error processing ${tableName}:`, error);
      }
    };

    // Remove seeded data from all tables
    await removeDataWithSeedMarker("sales", api.sales.getAllSales, api.sales.deleteSale);
    await removeDataWithSeedMarker("expenses", api.expenses.getAllExpenses, api.expenses.deleteExpense);
    await removeDataWithSeedMarker("liabilities", api.liabilities.getAllLiabilities, api.liabilities.deleteLiability);
    await removeDataWithSeedMarker("salaries", api.salaries.getAllSalaries, api.salaries.deleteSalary);
    await removeDataWithSeedMarker("bank PDC", api.bankPdc.getAllBankPdc, api.bankPdc.deleteBankPdc);
    await removeDataWithSeedMarker("future needs", api.futureNeeds.getAllFutureNeeds, api.futureNeeds.deleteFutureNeed);
    await removeDataWithSeedMarker("business in hand", api.businessInHand.getAllBusinessInHand, api.businessInHand.deleteBusinessInHand);
    await removeDataWithSeedMarker("cash flow", api.cashflow.getAllCashflow, api.cashflow.deleteCashflowEntry);

    console.log(`✅ Successfully removed ${totalRemoved} seeded records`);
    return null;
  },
});

// Get active seeding session
export const getActiveSeedingSession = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("seedingSessions"),
      _creationTime: v.number(),
      startTime: v.number(),
      active: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query("seedingSessions")
      .filter((q) => q.eq(q.field("active"), true))
      .first();
  },
});

// Mark seeding session as inactive
export const markSeedingSessionInactive = mutation({
  args: {
    sessionId: v.id("seedingSessions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { active: false });
    return null;
  },
});

// Clear ALL data from all tables (for testing purposes)
export const clearAllData = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    console.log("🧹 Starting complete data cleanup...");

    let totalCleared = 0;

    try {
      // Clear Sales
      const allSales = await ctx.runQuery(api.sales.getAllSales);
      for (const sale of allSales) {
        await ctx.runMutation(api.sales.deleteSale, { id: sale._id });
        totalCleared++;
      }
      console.log(`Cleared ${allSales.length} sales records`);
    } catch (error) {
      console.log("Error clearing sales:", error);
    }

    try {
      // Clear Expenses
      const allExpenses = await ctx.runQuery(api.expenses.getAllExpenses);
      for (const expense of allExpenses) {
        await ctx.runMutation(api.expenses.deleteExpense, { id: expense._id });
        totalCleared++;
      }
      console.log(`Cleared ${allExpenses.length} expense records`);
    } catch (error) {
      console.log("Error clearing expenses:", error);
    }

    try {
      // Clear Liabilities
      const allLiabilities = await ctx.runQuery(api.liabilities.getAllLiabilities);
      for (const liability of allLiabilities) {
        await ctx.runMutation(api.liabilities.deleteLiability, { id: liability._id });
        totalCleared++;
      }
      console.log(`Cleared ${allLiabilities.length} liability records`);
    } catch (error) {
      console.log("Error clearing liabilities:", error);
    }

    try {
      // Clear Salaries
      const allSalaries = await ctx.runQuery(api.salaries.getAllSalaries);
      for (const salary of allSalaries) {
        await ctx.runMutation(api.salaries.deleteSalary, { id: salary._id });
        totalCleared++;
      }
      console.log(`Cleared ${allSalaries.length} salary records`);
    } catch (error) {
      console.log("Error clearing salaries:", error);
    }

    try {
      // Clear Bank PDC
      const allBankPdc = await ctx.runQuery(api.bankPdc.getAllBankPdc);
      for (const pdc of allBankPdc) {
        await ctx.runMutation(api.bankPdc.deleteBankPdc, { id: pdc._id });
        totalCleared++;
      }
      console.log(`Cleared ${allBankPdc.length} bank PDC records`);
    } catch (error) {
      console.log("Error clearing bank PDC:", error);
    }

    try {
      // Clear Future Needs
      const allFutureNeeds = await ctx.runQuery(api.futureNeeds.getAllFutureNeeds);
      for (const need of allFutureNeeds) {
        await ctx.runMutation(api.futureNeeds.deleteFutureNeed, { id: need._id });
        totalCleared++;
      }
      console.log(`Cleared ${allFutureNeeds.length} future needs records`);
    } catch (error) {
      console.log("Error clearing future needs:", error);
    }

    try {
      // Clear Business in Hand
      const allBusinessInHand = await ctx.runQuery(api.businessInHand.getAllBusinessInHand);
      for (const business of allBusinessInHand) {
        await ctx.runMutation(api.businessInHand.deleteBusinessInHand, { id: business._id });
        totalCleared++;
      }
      console.log(`Cleared ${allBusinessInHand.length} business in hand records`);
    } catch (error) {
      console.log("Error clearing business in hand:", error);
    }

    try {
      // Clear Cash Flow entries
      const allCashFlow = await ctx.runQuery(api.cashflow.getAllCashflow);
      for (const cashflow of allCashFlow) {
        await ctx.runMutation(api.cashflow.deleteCashflowEntry, { id: cashflow._id });
        totalCleared++;
      }
      console.log(`Cleared ${allCashFlow.length} cash flow records`);
    } catch (error) {
      console.log("Error clearing cash flow:", error);
    }

    return null;
  },
});

// Comprehensive seed data for all modules with extensive test cases
export const seedDatabase = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    console.log("Starting comprehensive database seeding...");

    // Mark the start of seeding session
    const seedingStartTime = Date.now();
    await ctx.runMutation(api.seedData.markSeedingSession, { startTime: seedingStartTime });

    // Generate dynamic dates relative to current time
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-based

    const formatDate = (year: number, month: number, day: number): string => {
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };

    const formatMonth = (year: number, month: number): string => {
      return `${year}-${month.toString().padStart(2, '0')}`;
    };

    // Calculate relative months
    const getRelativeMonth = (monthsAgo: number): { year: number; month: number } => {
      let targetYear = currentYear;
      let targetMonth = currentMonth - monthsAgo;

      while (targetMonth <= 0) {
        targetMonth += 12;
        targetYear -= 1;
      }

      return { year: targetYear, month: targetMonth };
    };

    // 1. SALES DATA - Multiple entries with different currencies and scenarios
    const salesData = [
      {
        date: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 15),
        description: "Enterprise Software License - Annual Subscription [SEED]",
        cost: 25000,
        sellingPrice: 45000,
        expenses: 3500,
        currency: "USD",
      },
      {
        date: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 20),
        description: "Mobile App Development - iOS & Android [SEED]",
        cost: 18000,
        sellingPrice: 35000,
        expenses: 2800,
        currency: "USD",
      },
      {
        date: formatDate(getRelativeMonth(1).year, getRelativeMonth(1).month, 12),
        description: "Digital Marketing Campaign - Q1 [SEED]",
        cost: 8500,
        sellingPrice: 15000,
        expenses: 1200,
        currency: "AED",
      },
      {
        date: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 18),
        description: "Cloud Infrastructure Setup [SEED]",
        cost: 12000,
        sellingPrice: 22000,
        expenses: 1800,
        currency: "SAR",
      },
      {
        date: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 5),
        description: "E-commerce Platform Development [SEED]",
        cost: 15500,
        sellingPrice: 28000,
        expenses: 2100,
        currency: "USD",
      },
    ];

    console.log("Seeding sales data...");
    for (const sale of salesData) {
      await ctx.runMutation(api.sales.createSale, sale);
    }

    // 2. EXPENSES DATA - Various categories and statuses
    const expensesData = [
      {
        date: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 8),
        category: "Office Equipment",
        description: "MacBook Pro 16-inch for development team [SEED]",
        vendor: "Apple Store",
        amount: 2800,
        status: "paid" as const,
        currency: "USD",
      },
      {
        date: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 12),
        category: "Software Licenses",
        description: "Adobe Creative Suite Annual License [SEED]",
        vendor: "Adobe Inc",
        amount: 1200,
        status: "paid" as const,
        currency: "USD",
      },
      {
        date: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 18),
        category: "Marketing",
        description: "Google Ads Campaign [SEED]",
        vendor: "Google LLC",
        amount: 3500,
        status: "unpaid" as const,
        currency: "USD",
      },
      {
        date: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 8),
        category: "Office Rent",
        description: "Monthly office rent [SEED]",
        vendor: "Property Management Co",
        amount: 4500,
        status: "paid" as const,
        currency: "AED",
      },
      {
        date: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 8),
        category: "Utilities",
        description: "Electricity and Internet [SEED]",
        vendor: "Utility Services",
        amount: 850,
        status: "unpaid" as const,
        currency: "AED",
      },
      {
        date: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 15),
        category: "Travel",
        description: "Client meeting travel expenses [SEED]",
        vendor: "Emirates Airlines",
        amount: 2200,
        status: "paid" as const,
        currency: "SAR",
      },
    ];

    console.log("Seeding expenses data...");
    for (const expense of expensesData) {
      await ctx.runMutation(api.expenses.createExpense, expense);
    }

    // 3. LIABILITIES DATA - Different types and due dates
    const liabilitiesData = [
      {
        lenderParty: "First National Bank",
        liabilityType: "Business Loan",
        startDate: formatDate(getRelativeMonth(6).year, getRelativeMonth(6).month, 15),
        dueDate: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 15),
        originalAmount: 50000,
        currency: "USD",
        description: "Business expansion loan with 5.5% interest rate [SEED]",
      },
      {
        lenderParty: "Equipment Finance Corp",
        liabilityType: "Equipment Loan",
        startDate: formatDate(getRelativeMonth(4).year, getRelativeMonth(4).month, 30),
        dueDate: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 30),
        originalAmount: 25000,
        currency: "USD",
        description: "Equipment financing for office setup [SEED]",
      },
      {
        lenderParty: "Office Supplies Ltd",
        liabilityType: "Trade Payable",
        startDate: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 20),
        dueDate: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 20),
        originalAmount: 8500,
        currency: "AED",
        description: "Office furniture and supplies payment [SEED]",
      },
      {
        lenderParty: "Software Vendor Inc",
        liabilityType: "Software License Payable",
        startDate: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 10),
        dueDate: formatDate(getRelativeMonth(3).year, getRelativeMonth(3).month, 10),
        originalAmount: 12000,
        currency: "SAR",
        description: "Annual software license payment [SEED]",
      },
    ];

    console.log("Seeding liabilities data...");
    for (const liability of liabilitiesData) {
      await ctx.runMutation(api.liabilities.createLiability, liability);
    }

    // 4. SALARIES DATA - Different employees and payment statuses
    const salariesData = [
      {
        employeeName: "John Smith [SEED]",
        role: "Senior Developer",
        netSalary: 8850, // 8500 + 1200 - 850
        month: formatMonth(getRelativeMonth(2).year, getRelativeMonth(2).month),
        paymentDate: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 30),
        paymentStatus: "paid" as const,
        currency: "USD",
      },
      {
        employeeName: "Sarah Johnson [SEED]",
        role: "UI/UX Designer",
        netSalary: 6650, // 6500 + 800 - 650
        month: formatMonth(getRelativeMonth(2).year, getRelativeMonth(2).month),
        paymentDate: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 30),
        paymentStatus: "paid" as const,
        currency: "USD",
      },
      {
        employeeName: "Ahmed Al-Rashid [SEED]",
        role: "Project Manager",
        netSalary: 8020, // 7800 + 1000 - 780
        month: formatMonth(getRelativeMonth(0).year, getRelativeMonth(0).month),
        paymentDate: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 29),
        paymentStatus: "pending" as const,
        currency: "AED",
      },
      {
        employeeName: "Maria Garcia [SEED]",
        role: "Marketing Specialist",
        netSalary: 5550, // 5500 + 600 - 550
        month: formatMonth(getRelativeMonth(0).year, getRelativeMonth(0).month),
        paymentDate: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 29),
        paymentStatus: "pending" as const,
        currency: "SAR",
      },
    ];

    console.log("Seeding salaries data...");
    for (const salary of salariesData) {
      await ctx.runMutation(api.salaries.createSalary, salary);
    }

    // 5. BANK PDC DATA - Post-dated cheques with various statuses
    const bankPdcData = [
      {
        date: formatDate(getRelativeMonth(1).year, getRelativeMonth(1).month, 15),
        bank: "Emirates NBD",
        chequeNumber: "CHQ001234",
        code: "PDC-001",
        supplier: "Tech Solutions LLC [SEED]",
        description: "Payment for software development services [SEED]",
        amount: 15000,
        status: "pending" as const,
        currency: "AED",
      },
      {
        date: formatDate(getRelativeMonth(1).year, getRelativeMonth(1).month, 20),
        bank: "First Abu Dhabi Bank",
        chequeNumber: "CHQ001235",
        code: "PDC-002",
        supplier: "Office Furniture Co [SEED]",
        description: "Office furniture and equipment payment [SEED]",
        amount: 8500,
        status: "pending" as const,
        currency: "AED",
      },
      {
        date: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 28),
        bank: "ADCB Bank [SEED]",
        chequeNumber: "CHQ001236",
        code: "PDC-003",
        supplier: "Marketing Agency",
        description: "Digital marketing campaign payment [SEED]",
        amount: 12000,
        status: "cleared" as const,
        currency: "USD",
      },
      {
        date: formatDate(getRelativeMonth(3).year, getRelativeMonth(3).month, 10),
        bank: "Mashreq Bank [SEED]",
        chequeNumber: "CHQ001237",
        code: "PDC-004",
        supplier: "Software Vendor",
        description: "Annual software license payment [SEED]",
        amount: 6500,
        status: "pending" as const,
        currency: "SAR",
      },
    ];

    console.log("Seeding bank PDC data...");
    for (const pdc of bankPdcData) {
      await ctx.runMutation(api.bankPdc.createBankPdc, pdc);
    }

    // 6. FUTURE NEEDS DATA - Monthly planning with different types
    const futureNeedsData = [
      {
        month: "2025-09",
        description: "New Server Hardware",
        quantity: 2,
        amount: 5500,
        status: "one-time" as const,
        currency: "USD",
      },
      {
        month: "2025-10",
        description: "Office Expansion - Additional Desks",
        quantity: 5,
        amount: 1200,
        status: "one-time" as const,
        currency: "AED",
      },
      {
        month: "2025-09",
        description: "Monthly Cloud Hosting",
        quantity: 1,
        amount: 850,
        status: "recurring" as const,
        currency: "USD",
      },
      {
        month: "2025-11",
        description: "Team Building Event",
        quantity: 1,
        amount: 3500,
        status: "one-time" as const,
        currency: "SAR",
      },
      {
        month: "2025-10",
        description: "Software Maintenance Contracts",
        quantity: 3,
        amount: 2200,
        status: "recurring" as const,
        currency: "USD",
      },
    ];

    console.log("Seeding future needs data...");
    for (const need of futureNeedsData) {
      await ctx.runMutation(api.futureNeeds.createFutureNeed, need);
    }

    // 7. BUSINESS IN HAND DATA - Revenue pipeline
    const businessInHandData = [
      {
        type: "po_in_hand" as const,
        description: "Enterprise CRM System Development",
        amount: 85000,
        expectedDate: "2025-10-15",
        status: "confirmed" as const,
        currency: "USD",
      },
      {
        type: "pending_invoice" as const,
        description: "Website Redesign Project - Final Payment",
        amount: 12000,
        expectedDate: "2025-09-10",
        status: "pending" as const,
        currency: "AED",
      },
      {
        type: "expected_revenue" as const,
        description: "Mobile App Maintenance Contract",
        amount: 25000,
        expectedDate: "2025-10-20",
        status: "confirmed" as const,
        currency: "SAR",
      },
      {
        type: "po_in_hand" as const,
        description: "Digital Marketing Campaign - Q2",
        amount: 18500,
        expectedDate: "2025-10-01",
        status: "pending" as const,
        currency: "USD",
      },
      {
        type: "pending_invoice" as const,
        description: "Cloud Migration Services",
        amount: 32000,
        expectedDate: "2025-09-25",
        status: "confirmed" as const,
        currency: "AED",
      },
    ];

    console.log("Seeding business in hand data...");
    for (const business of businessInHandData) {
      await ctx.runMutation(api.businessInHand.createBusinessInHand, business);
    }

    // 8. CASH FLOW DATA - Manual cashflow entries for testing
    const cashFlowData = [
      {
        date: formatDate(getRelativeMonth(2).year, getRelativeMonth(2).month, 15),
        type: "inflow" as const,
        category: "Sales Revenue",
        description: "Enterprise Software License Payment [SEED]",
        amount: 45000,
        currency: "USD",
      },
      {
        date: formatDate(getRelativeMonth(1).year, getRelativeMonth(1).month, 20),
        type: "outflow" as const,
        category: "Office Rent",
        description: "Monthly office rental fees [SEED]",
        amount: 4500,
        currency: "AED",
      },
      {
        date: formatDate(getRelativeMonth(1).year, getRelativeMonth(1).month, 5),
        type: "inflow" as const,
        category: "Service Revenue",
        description: "Digital Marketing Campaign [SEED]",
        amount: 15000,
        currency: "AED",
      },
      {
        date: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 10),
        type: "outflow" as const,
        category: "Software Licenses",
        description: "Adobe Creative Suite Annual License [SEED]",
        amount: 1200,
        currency: "USD",
      },
      {
        date: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 18),
        type: "inflow" as const,
        category: "Cloud Services",
        description: "Cloud Infrastructure Setup [SEED]",
        amount: 22000,
        currency: "SAR",
      },
      {
        date: formatDate(getRelativeMonth(0).year, getRelativeMonth(0).month, 20),
        type: "outflow" as const,
        category: "Travel",
        description: "Client meeting expenses [SEED]",
        amount: 2200,
        currency: "SAR",
      },
    ];

    console.log("Seeding cash flow data...");
    for (const cashflow of cashFlowData) {
      await ctx.runMutation(api.cashflow.createCashflowEntry, cashflow);
    }

    // 9. CURRENCY SETTINGS - Set default currency
    console.log("Setting up currency preferences...");
    await ctx.runMutation(api.currency.updateCurrencySettings, {
      selectedCurrency: "USD",
    });

    console.log("✅ Comprehensive database seeding completed successfully!");
    console.log("📊 Added sample data for all modules:");
    console.log("   - 5 Sales records");
    console.log("   - 6 Expense records");
    console.log("   - 4 Liability records");
    console.log("   - 4 Salary records");
    console.log("   - 4 Bank PDC records");
    console.log("   - 5 Future Needs records");
    console.log("   - 5 Business in Hand records");
    console.log("   - 6 Cash Flow records");
    console.log("   - Currency settings configured");

    return null;
  },
});
