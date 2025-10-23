import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Track seeding sessions for selective cleanup
const SEEDING_SESSION_KEY = "seeding_session";

// Mark the start of a seeding session
export const markSeedingSession = mutation({
  args: {
    startTime: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Store the seeding session timestamp
    // We'll use a simple document to track the session
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

    // Get the active seeding session using a query
    const activeSession = await ctx.runQuery(api.seedData.getActiveSeedingSession);

    if (!activeSession) {
      console.log("No active seeding session found");
      return null;
    }

    const seedingStartTime = activeSession.startTime;
    const seedingEndTime = Date.now();

    console.log(`Removing data seeded between ${new Date(seedingStartTime)} and ${new Date(seedingEndTime)}`);

    // For now, let's implement a simpler approach
    // We'll remove data based on specific patterns that identify seeded data
    let totalRemoved = 0;

    try {
      // Remove sales with specific seeded descriptions
      const allSales = await ctx.runQuery(api.sales.getAllSales);
      const seededSales = allSales.filter(sale =>
        sale._creationTime >= seedingStartTime &&
        sale._creationTime <= seedingEndTime &&
        (sale.description.includes("Enterprise Software License") ||
         sale.description.includes("Mobile App Development") ||
         sale.description.includes("E-commerce Platform") ||
         sale.description.includes("Digital Marketing Campaign") ||
         sale.description.includes("Cloud Infrastructure Setup"))
      );

      for (const sale of seededSales) {
        try {
          await ctx.runMutation(api.sales.deleteSale, { id: sale._id });
          totalRemoved++;
        } catch (error) {
          console.log(`Error deleting sale ${sale._id}:`, error);
        }
      }

      console.log(`Removed ${seededSales.length} seeded sales records`);
    } catch (error) {
      console.log("Error processing sales:", error);
    }

    try {
      // Remove expenses with specific seeded descriptions
      const allExpenses = await ctx.runQuery(api.expenses.getAllExpenses);
      const seededExpenses = allExpenses.filter(expense =>
        expense._creationTime >= seedingStartTime &&
        expense._creationTime <= seedingEndTime &&
        (expense.description.includes("MacBook Pro") ||
         expense.description.includes("Adobe Creative Suite") ||
         expense.description.includes("Google Ads Campaign") ||
         expense.description.includes("office rent") ||
         expense.description.includes("Electricity and Internet") ||
         expense.description.includes("travel expenses"))
      );

      for (const expense of seededExpenses) {
        try {
          await ctx.runMutation(api.expenses.deleteExpense, { id: expense._id });
          totalRemoved++;
        } catch (error) {
          console.log(`Error deleting expense ${expense._id}:`, error);
        }
      }

      console.log(`Removed ${seededExpenses.length} seeded expense records`);
    } catch (error) {
      console.log("Error processing expenses:", error);
    }

    // Mark the seeding session as inactive
    await ctx.runMutation(api.seedData.markSeedingSessionInactive, { sessionId: activeSession._id });

    console.log(`✅ Successfully removed ${totalRemoved} seeded records`);
    console.log("User-added data has been preserved");

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

    // 1. SALES DATA - Multiple entries with different currencies and scenarios
    const salesData = [
      {
        date: "2024-01-15",
        description: "Enterprise Software License - Annual Subscription",
        cost: 25000,
        sellingPrice: 45000,
        expenses: 3500,
        currency: "USD",
      },
      {
        date: "2024-01-20",
        description: "Mobile App Development - iOS & Android",
        cost: 18000,
        sellingPrice: 35000,
        expenses: 2800,
        currency: "USD",
      },
      {
        date: "2024-02-05",
        description: "E-commerce Platform with Payment Gateway",
        cost: 32000,
        sellingPrice: 65000,
        expenses: 5200,
        currency: "USD",
      },
      {
        date: "2024-02-12",
        description: "Digital Marketing Campaign - Q1",
        cost: 8500,
        sellingPrice: 15000,
        expenses: 1200,
        currency: "AED",
      },
      {
        date: "2024-02-18",
        description: "Cloud Infrastructure Setup",
        cost: 12000,
        sellingPrice: 22000,
        expenses: 1800,
        currency: "SAR",
      },
    ];

    console.log("Seeding sales data...");
    for (const sale of salesData) {
      await ctx.runMutation(api.sales.createSale, sale);
    }

    // 2. EXPENSES DATA - Various categories and statuses
    const expensesData = [
      {
        date: "2024-01-08",
        category: "Office Equipment",
        description: "MacBook Pro 16-inch for development team",
        vendor: "Apple Store",
        amount: 2800,
        status: "paid" as const,
        currency: "USD",
      },
      {
        date: "2024-01-12",
        category: "Software Licenses",
        description: "Adobe Creative Suite Annual License",
        vendor: "Adobe Inc",
        amount: 1200,
        status: "paid" as const,
        currency: "USD",
      },
      {
        date: "2024-01-18",
        category: "Marketing",
        description: "Google Ads Campaign - January",
        vendor: "Google LLC",
        amount: 3500,
        status: "unpaid" as const,
        currency: "USD",
      },
      {
        date: "2024-02-02",
        category: "Office Rent",
        description: "Monthly office rent - February",
        vendor: "Property Management Co",
        amount: 4500,
        status: "paid" as const,
        currency: "AED",
      },
      {
        date: "2024-02-08",
        category: "Utilities",
        description: "Electricity and Internet - February",
        vendor: "Utility Services",
        amount: 850,
        status: "unpaid" as const,
        currency: "AED",
      },
      {
        date: "2024-02-15",
        category: "Travel",
        description: "Client meeting travel expenses",
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
        startDate: "2023-06-15",
        dueDate: "2024-06-15",
        originalAmount: 50000,
        currency: "USD",
        description: "Business expansion loan with 5.5% interest rate",
      },
      {
        lenderParty: "Equipment Finance Corp",
        liabilityType: "Equipment Loan",
        startDate: "2023-10-30",
        dueDate: "2024-04-30",
        originalAmount: 25000,
        currency: "USD",
        description: "Equipment financing for office setup",
      },
      {
        lenderParty: "Office Supplies Ltd",
        liabilityType: "Trade Payable",
        startDate: "2024-02-20",
        dueDate: "2024-03-20",
        originalAmount: 8500,
        currency: "AED",
        description: "Office furniture and supplies payment",
      },
      {
        lenderParty: "Software Vendor Inc",
        liabilityType: "Software License Payable",
        startDate: "2023-11-10",
        dueDate: "2024-05-10",
        originalAmount: 12000,
        currency: "SAR",
        description: "Annual software license payment",
      },
    ];

    console.log("Seeding liabilities data...");
    for (const liability of liabilitiesData) {
      await ctx.runMutation(api.liabilities.createLiability, liability);
    }

    // 4. SALARIES DATA - Different employees and payment statuses
    const salariesData = [
      {
        employeeName: "John Smith",
        role: "Senior Developer",
        netSalary: 8850, // 8500 + 1200 - 850
        month: "2024-01",
        paymentDate: "2024-01-31",
        paymentStatus: "paid" as const,
        currency: "USD",
      },
      {
        employeeName: "Sarah Johnson",
        role: "UI/UX Designer",
        netSalary: 6650, // 6500 + 800 - 650
        month: "2024-01",
        paymentDate: "2024-01-31",
        paymentStatus: "paid" as const,
        currency: "USD",
      },
      {
        employeeName: "Ahmed Al-Rashid",
        role: "Project Manager",
        netSalary: 8020, // 7800 + 1000 - 780
        month: "2024-02",
        paymentDate: "2024-02-29",
        paymentStatus: "pending" as const,
        currency: "AED",
      },
      {
        employeeName: "Maria Garcia",
        role: "Marketing Specialist",
        netSalary: 5550, // 5500 + 600 - 550
        month: "2024-02",
        paymentDate: "2024-02-29",
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
        date: "2024-03-15",
        bank: "Emirates NBD",
        chequeNumber: "CHQ001234",
        code: "PDC-001",
        supplier: "Tech Solutions LLC",
        description: "Payment for software development services",
        amount: 15000,
        status: "pending" as const,
        currency: "AED",
      },
      {
        date: "2024-04-20",
        bank: "First Abu Dhabi Bank",
        chequeNumber: "CHQ001235",
        code: "PDC-002",
        supplier: "Office Furniture Co",
        description: "Office furniture and equipment payment",
        amount: 8500,
        status: "pending" as const,
        currency: "AED",
      },
      {
        date: "2024-02-28",
        bank: "ADCB Bank",
        chequeNumber: "CHQ001236",
        code: "PDC-003",
        supplier: "Marketing Agency",
        description: "Digital marketing campaign payment",
        amount: 12000,
        status: "cleared" as const,
        currency: "USD",
      },
      {
        date: "2024-05-10",
        bank: "Mashreq Bank",
        chequeNumber: "CHQ001237",
        code: "PDC-004",
        supplier: "Software Vendor",
        description: "Annual software license payment",
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
        month: "2024-03",
        description: "New Server Hardware",
        quantity: 2,
        amount: 5500,
        status: "one-time" as const,
        currency: "USD",
      },
      {
        month: "2024-04",
        description: "Office Expansion - Additional Desks",
        quantity: 5,
        amount: 1200,
        status: "one-time" as const,
        currency: "AED",
      },
      {
        month: "2024-03",
        description: "Monthly Cloud Hosting",
        quantity: 1,
        amount: 850,
        status: "recurring" as const,
        currency: "USD",
      },
      {
        month: "2024-05",
        description: "Team Building Event",
        quantity: 1,
        amount: 3500,
        status: "one-time" as const,
        currency: "SAR",
      },
      {
        month: "2024-04",
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
        expectedDate: "2024-04-15",
        status: "confirmed" as const,
        currency: "USD",
      },
      {
        type: "pending_invoice" as const,
        description: "Website Redesign Project - Final Payment",
        amount: 12000,
        expectedDate: "2024-03-10",
        status: "pending" as const,
        currency: "AED",
      },
      {
        type: "expected_revenue" as const,
        description: "Mobile App Maintenance Contract",
        amount: 25000,
        expectedDate: "2024-05-20",
        status: "confirmed" as const,
        currency: "SAR",
      },
      {
        type: "po_in_hand" as const,
        description: "Digital Marketing Campaign - Q2",
        amount: 18500,
        expectedDate: "2024-04-01",
        status: "pending" as const,
        currency: "USD",
      },
      {
        type: "pending_invoice" as const,
        description: "Cloud Migration Services",
        amount: 32000,
        expectedDate: "2024-03-25",
        status: "confirmed" as const,
        currency: "AED",
      },
    ];

    console.log("Seeding business in hand data...");
    for (const business of businessInHandData) {
      await ctx.runMutation(api.businessInHand.createBusinessInHand, business);
    }

    // 8. CURRENCY SETTINGS - Set default currency
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
    console.log("   - Currency settings configured");

    return null;
  },
});
