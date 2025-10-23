import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { convertCurrency, formatCurrency, type Currency } from "@/lib/currency-utils";

export function useCurrencyConversion() {
  const currencySettings = useQuery(api.currency.getCurrencySettings, {});
  const selectedCurrency = (currencySettings?.selectedCurrency || "USD") as Currency;

  // Get all data with original currencies
  const sales = useQuery(api.sales.getAllSales, {});
  const expenses = useQuery(api.expenses.getAllExpenses, {});
  const liabilities = useQuery(api.liabilities.getAllLiabilities, {});
  const salaries = useQuery(api.salaries.getAllSalaries, {});
  const businessInHand = useQuery(api.businessInHand.getAllBusinessInHand, {});

  const convertedData = useMemo(() => {
    if (!sales || !expenses || !liabilities || !salaries || !businessInHand) {
      return null;
    }

    // Convert all amounts to selected currency
    const convertedSales = sales.map(sale => ({
      ...sale,
      convertedSellingPrice: convertCurrency(sale.sellingPrice, sale.currency as Currency, selectedCurrency),
      convertedCost: convertCurrency(sale.cost, sale.currency as Currency, selectedCurrency),
      convertedExpenses: convertCurrency(sale.expenses, sale.currency as Currency, selectedCurrency),
      convertedGrossProfit: convertCurrency(sale.grossProfit, sale.currency as Currency, selectedCurrency),
      convertedNetProfit: convertCurrency(sale.netProfit, sale.currency as Currency, selectedCurrency),
    }));

    const convertedExpenses = expenses.map(expense => ({
      ...expense,
      convertedAmount: convertCurrency(expense.amount, expense.currency as Currency, selectedCurrency),
    }));

    const convertedLiabilities = liabilities.map(liability => ({
      ...liability,
      convertedOriginalAmount: convertCurrency(liability.originalAmount, liability.currency as Currency, selectedCurrency),
      convertedOutstandingBalance: convertCurrency(liability.outstandingBalance, liability.currency as Currency, selectedCurrency),
    }));

    const convertedSalaries = salaries.map(salary => ({
      ...salary,
      convertedNetSalary: convertCurrency(salary.netSalary, salary.currency as Currency, selectedCurrency),
    }));

    const convertedBusinessInHand = businessInHand.map(bih => ({
      ...bih,
      convertedAmount: convertCurrency(bih.amount, bih.currency as Currency, selectedCurrency),
    }));

    // Calculate summary metrics in selected currency
    const totalExpenses = convertedExpenses.reduce((sum, exp) => sum + exp.convertedAmount, 0);
    const outstandingLiabilities = convertedLiabilities.reduce((sum, lib) => sum + lib.convertedOutstandingBalance, 0);
    
    const salariesPaid = convertedSalaries
      .filter(sal => sal.paymentStatus === "paid")
      .reduce((sum, sal) => sum + sal.convertedNetSalary, 0);
    
    const salariesPending = convertedSalaries
      .filter(sal => sal.paymentStatus === "pending")
      .reduce((sum, sal) => sum + sal.convertedNetSalary, 0);

    const totalSales = convertedSales.reduce((sum, sale) => sum + sale.convertedSellingPrice, 0);
    const totalProfit = convertedSales.reduce((sum, sale) => sum + sale.convertedNetProfit, 0);
    const businessInHandValue = convertedBusinessInHand
      .filter(bih => bih.status !== "received")
      .reduce((sum, bih) => sum + bih.convertedAmount, 0);

    const totalInflows = totalSales;
    const totalOutflows = totalExpenses + salariesPaid + salariesPending;
    const netCashflow = totalInflows - totalOutflows;

    return {
      summary: {
        totalExpenses,
        outstandingLiabilities,
        salariesPaid,
        salariesPending,
        totalInflows,
        totalOutflows,
        netCashflow,
        businessInHandValue,
        totalSales,
        totalProfit,
      },
      convertedSales,
      convertedExpenses,
      convertedLiabilities,
      convertedSalaries,
      convertedBusinessInHand,
    };
  }, [sales, expenses, liabilities, salaries, businessInHand, selectedCurrency]);

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, selectedCurrency, { useCustomFont: true });
  };

  return {
    selectedCurrency,
    convertedData,
    formatAmount,
    convertCurrency: (amount: number, fromCurrency: Currency) => 
      convertCurrency(amount, fromCurrency, selectedCurrency),
  };
}
