// Excel export utilities
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { convertCurrency, type Currency } from './currency-utils';

export interface ExportColumn {
  key: string;
  header: string;
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date';
  width?: number;
}

export interface ExportData {
  [key: string]: any;
}

export interface ExportSummary {
  label: string;
  value: number | string;
  type: 'currency' | 'number' | 'percentage';
}

export interface ExportOptions {
  filename: string;
  sheetName: string;
  columns: ExportColumn[];
  data: ExportData[];
  summaries?: ExportSummary[];
  selectedCurrency: Currency;
}

/**
 * Format date for Excel export
 */
export function formatDateForExport(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'dd-MMM-yyyy'); // 15-Sep-2024
  } catch {
    return dateString;
  }
}

/**
 * Format number with commas
 */
export function formatNumberForExport(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format currency for Excel export
 */
export function formatCurrencyForExport(value: number, currency: Currency): string {
  const formatted = formatNumberForExport(value);
  const symbol = currency === 'USD' ? '$' : currency === 'SAR' ? 'ر.س' : 'د.إ';
  
  if (currency === 'SAR' || currency === 'AED') {
    return `${formatted} ${symbol}`;
  } else {
    return `${symbol}${formatted}`;
  }
}

/**
 * Format percentage for Excel export
 */
export function formatPercentageForExport(value: number): string {
  return `${formatNumberForExport(value)}%`;
}

/**
 * Process data for export with currency conversion
 */
export function processDataForExport(
  data: ExportData[],
  columns: ExportColumn[],
  selectedCurrency: Currency
): any[][] {
  const processedData: any[][] = [];
  
  // Add headers
  const headers = columns.map(col => col.header);
  processedData.push(headers);
  
  // Process each row
  data.forEach(row => {
    const processedRow: any[] = [];
    
    columns.forEach(column => {
      let value = row[column.key];
      
      // Handle different data types
      switch (column.type) {
        case 'date':
          processedRow.push(value ? formatDateForExport(value) : '');
          break;
          
        case 'currency':
          if (typeof value === 'number') {
            // Convert currency if needed
            const originalCurrency = row.currency as Currency || selectedCurrency;
            const convertedValue = convertCurrency(value, originalCurrency, selectedCurrency);
            processedRow.push(formatCurrencyForExport(convertedValue, selectedCurrency));
          } else {
            processedRow.push('');
          }
          break;
          
        case 'percentage':
          if (typeof value === 'number') {
            processedRow.push(formatPercentageForExport(value));
          } else {
            processedRow.push('');
          }
          break;
          
        case 'number':
          if (typeof value === 'number') {
            processedRow.push(formatNumberForExport(value));
          } else {
            processedRow.push(value || '');
          }
          break;
          
        default: // text
          processedRow.push(value || '');
          break;
      }
    });
    
    processedData.push(processedRow);
  });
  
  return processedData;
}

/**
 * Add summary rows to the data
 */
export function addSummaryRows(
  processedData: any[][],
  summaries: ExportSummary[],
  columns: ExportColumn[],
  selectedCurrency: Currency
): void {
  if (!summaries.length) return;
  
  // Add empty row
  processedData.push(new Array(columns.length).fill(''));
  
  // Add summary header
  const summaryHeaderRow = new Array(columns.length).fill('');
  summaryHeaderRow[0] = 'SUMMARY TOTALS';
  processedData.push(summaryHeaderRow);
  
  // Add summary rows
  summaries.forEach(summary => {
    const summaryRow = new Array(columns.length).fill('');
    summaryRow[0] = summary.label;
    
    let formattedValue: string;
    if (typeof summary.value === 'number') {
      switch (summary.type) {
        case 'currency':
          formattedValue = formatCurrencyForExport(summary.value, selectedCurrency);
          break;
        case 'percentage':
          formattedValue = formatPercentageForExport(summary.value);
          break;
        default:
          formattedValue = formatNumberForExport(summary.value);
          break;
      }
    } else {
      formattedValue = String(summary.value);
    }
    
    summaryRow[1] = formattedValue;
    processedData.push(summaryRow);
  });
}

/**
 * Create and download Excel file
 */
export function exportToExcel(options: ExportOptions): void {
  try {
    // Process data
    const processedData = processDataForExport(
      options.data,
      options.columns,
      options.selectedCurrency
    );
    
    // Add summary rows if provided
    if (options.summaries) {
      addSummaryRows(processedData, options.summaries, options.columns, options.selectedCurrency);
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(processedData);
    
    // Set column widths
    const colWidths = options.columns.map(col => ({
      wch: col.width || 15
    }));
    ws['!cols'] = colWidths;
    
    // Style the header row (make it bold)
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      
      ws[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' }
      };
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, options.sheetName);
    
    // Generate filename with current date
    const today = format(new Date(), 'yyyy-MM-dd');
    const filename = options.filename.replace('{date}', today);
    
    // Download file
    XLSX.writeFile(wb, filename);
    
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data to Excel');
  }
}

/**
 * Sales-specific export configuration
 */
export function exportSalesData(
  salesData: any[],
  selectedCurrency: Currency
): void {
  const columns: ExportColumn[] = [
    { key: 'date', header: 'Date', type: 'date', width: 12 },
    { key: 'description', header: 'Description', type: 'text', width: 30 },
    { key: 'cost', header: 'Cost', type: 'currency', width: 15 },
    { key: 'sellingPrice', header: 'Selling Price', type: 'currency', width: 15 },
    { key: 'grossProfit', header: 'Gross Profit', type: 'currency', width: 15 },
    { key: 'grossProfitMargin', header: 'GP Margin %', type: 'percentage', width: 12 },
    { key: 'netProfit', header: 'Net Profit', type: 'currency', width: 15 },
    { key: 'netProfitMargin', header: 'NP Margin %', type: 'percentage', width: 12 },
    { key: 'currency', header: 'Original Currency', type: 'text', width: 10 },
  ];
  
  // Calculate summaries
  const totalSales = salesData.reduce((sum, sale) => {
    const convertedAmount = convertCurrency(sale.sellingPrice, sale.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const totalCost = salesData.reduce((sum, sale) => {
    const convertedAmount = convertCurrency(sale.cost, sale.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const totalGrossProfit = salesData.reduce((sum, sale) => {
    const convertedAmount = convertCurrency(sale.grossProfit, sale.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const totalNetProfit = salesData.reduce((sum, sale) => {
    const convertedAmount = convertCurrency(sale.netProfit, sale.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const avgGrossMargin = salesData.length > 0 
    ? salesData.reduce((sum, sale) => sum + sale.grossProfitMargin, 0) / salesData.length
    : 0;
    
  const avgNetMargin = salesData.length > 0 
    ? salesData.reduce((sum, sale) => sum + sale.netProfitMargin, 0) / salesData.length
    : 0;
  
  const summaries: ExportSummary[] = [
    { label: 'Total Sales', value: totalSales, type: 'currency' },
    { label: 'Total Cost', value: totalCost, type: 'currency' },
    { label: 'Total Gross Profit', value: totalGrossProfit, type: 'currency' },
    { label: 'Total Net Profit', value: totalNetProfit, type: 'currency' },
    { label: 'Average GP Margin', value: avgGrossMargin, type: 'percentage' },
    { label: 'Average NP Margin', value: avgNetMargin, type: 'percentage' },
    { label: 'Total Records', value: salesData.length, type: 'number' },
  ];
  
  exportToExcel({
    filename: 'Sales_Export_{date}.xlsx',
    sheetName: 'Sales Data',
    columns,
    data: salesData,
    summaries,
    selectedCurrency,
  });
}

/**
 * Expenses-specific export configuration
 */
export function exportExpensesData(
  expensesData: any[],
  selectedCurrency: Currency
): void {
  const columns: ExportColumn[] = [
    { key: 'date', header: 'Date', type: 'date', width: 12 },
    { key: 'description', header: 'Description', type: 'text', width: 30 },
    { key: 'category', header: 'Category', type: 'text', width: 15 },
    { key: 'amount', header: 'Amount', type: 'currency', width: 15 },
    { key: 'status', header: 'Status', type: 'text', width: 12 },
    { key: 'currency', header: 'Original Currency', type: 'text', width: 10 },
  ];
  
  // Calculate summaries
  const totalExpenses = expensesData.reduce((sum, expense) => {
    const convertedAmount = convertCurrency(expense.amount, expense.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const paidExpenses = expensesData
    .filter(expense => expense.status === 'paid')
    .reduce((sum, expense) => {
      const convertedAmount = convertCurrency(expense.amount, expense.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const unpaidExpenses = expensesData
    .filter(expense => expense.status === 'unpaid')
    .reduce((sum, expense) => {
      const convertedAmount = convertCurrency(expense.amount, expense.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const summaries: ExportSummary[] = [
    { label: 'Total Expenses', value: totalExpenses, type: 'currency' },
    { label: 'Paid Expenses', value: paidExpenses, type: 'currency' },
    { label: 'Unpaid Expenses', value: unpaidExpenses, type: 'currency' },
    { label: 'Total Records', value: expensesData.length, type: 'number' },
  ];
  
  exportToExcel({
    filename: 'Expenses_Export_{date}.xlsx',
    sheetName: 'Expenses Data',
    columns,
    data: expensesData,
    summaries,
    selectedCurrency,
  });
}

/**
 * Liabilities-specific export configuration
 */
export function exportLiabilitiesData(
  liabilitiesData: any[],
  selectedCurrency: Currency
): void {
  const columns: ExportColumn[] = [
    { key: 'startDate', header: 'Start Date', type: 'date', width: 12 },
    { key: 'endDate', header: 'End Date', type: 'date', width: 12 },
    { key: 'description', header: 'Description', type: 'text', width: 30 },
    { key: 'amount', header: 'Amount', type: 'currency', width: 15 },
    { key: 'recurringAmount', header: 'Recurring Amount', type: 'currency', width: 15 },
    { key: 'status', header: 'Status', type: 'text', width: 12 },
    { key: 'currency', header: 'Original Currency', type: 'text', width: 10 },
  ];
  
  // Calculate summaries
  const totalAmount = liabilitiesData.reduce((sum, liability) => {
    const convertedAmount = convertCurrency(liability.amount, liability.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const totalRecurringAmount = liabilitiesData.reduce((sum, liability) => {
    const convertedAmount = convertCurrency(liability.recurringAmount, liability.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const activeCount = liabilitiesData.filter(l => l.status === 'active').length;
  const completedCount = liabilitiesData.filter(l => l.status === 'completed').length;
  
  const summaries: ExportSummary[] = [
    { label: 'Total Amount', value: totalAmount, type: 'currency' },
    { label: 'Total Recurring Amount', value: totalRecurringAmount, type: 'currency' },
    { label: 'Active Liabilities', value: activeCount, type: 'number' },
    { label: 'Completed Liabilities', value: completedCount, type: 'number' },
    { label: 'Total Records', value: liabilitiesData.length, type: 'number' },
  ];
  
  exportToExcel({
    filename: 'Liabilities_Export_{date}.xlsx',
    sheetName: 'Liabilities Data',
    columns,
    data: liabilitiesData,
    summaries,
    selectedCurrency,
  });
}

/**
 * Salaries-specific export configuration
 */
export function exportSalariesData(
  salariesData: any[],
  selectedCurrency: Currency
): void {
  const columns: ExportColumn[] = [
    { key: 'month', header: 'Month', type: 'text', width: 12 },
    { key: 'employeeName', header: 'Employee Name', type: 'text', width: 20 },
    { key: 'basicSalary', header: 'Basic Salary', type: 'currency', width: 15 },
    { key: 'allowances', header: 'Allowances', type: 'currency', width: 15 },
    { key: 'deductions', header: 'Deductions', type: 'currency', width: 15 },
    { key: 'netSalary', header: 'Net Salary', type: 'currency', width: 15 },
    { key: 'status', header: 'Status', type: 'text', width: 12 },
    { key: 'currency', header: 'Original Currency', type: 'text', width: 10 },
  ];
  
  // Calculate summaries
  const totalSalaries = salariesData.reduce((sum, salary) => {
    const convertedAmount = convertCurrency(salary.netSalary, salary.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const paidSalaries = salariesData
    .filter(salary => salary.status === 'paid')
    .reduce((sum, salary) => {
      const convertedAmount = convertCurrency(salary.netSalary, salary.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const pendingSalaries = salariesData
    .filter(salary => salary.status === 'pending')
    .reduce((sum, salary) => {
      const convertedAmount = convertCurrency(salary.netSalary, salary.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const summaries: ExportSummary[] = [
    { label: 'Total Salaries', value: totalSalaries, type: 'currency' },
    { label: 'Paid Salaries', value: paidSalaries, type: 'currency' },
    { label: 'Pending Salaries', value: pendingSalaries, type: 'currency' },
    { label: 'Total Records', value: salariesData.length, type: 'number' },
  ];
  
  exportToExcel({
    filename: 'Salaries_Export_{date}.xlsx',
    sheetName: 'Salaries Data',
    columns,
    data: salariesData,
    summaries,
    selectedCurrency,
  });
}

/**
 * Bank PDC-specific export configuration
 */
export function exportBankPdcData(
  bankPdcData: any[],
  selectedCurrency: Currency
): void {
  const columns: ExportColumn[] = [
    { key: 'date', header: 'Date', type: 'date', width: 12 },
    { key: 'code', header: 'Code', type: 'text', width: 15 },
    { key: 'description', header: 'Description', type: 'text', width: 30 },
    { key: 'amount', header: 'Amount', type: 'currency', width: 15 },
    { key: 'status', header: 'Status', type: 'text', width: 12 },
    { key: 'currency', header: 'Original Currency', type: 'text', width: 10 },
  ];
  
  // Calculate summaries
  const totalAmount = bankPdcData.reduce((sum, pdc) => {
    const convertedAmount = convertCurrency(pdc.amount, pdc.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const pendingAmount = bankPdcData
    .filter(pdc => pdc.status === 'pending')
    .reduce((sum, pdc) => {
      const convertedAmount = convertCurrency(pdc.amount, pdc.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const clearedAmount = bankPdcData
    .filter(pdc => pdc.status === 'cleared')
    .reduce((sum, pdc) => {
      const convertedAmount = convertCurrency(pdc.amount, pdc.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const summaries: ExportSummary[] = [
    { label: 'Total Amount', value: totalAmount, type: 'currency' },
    { label: 'Pending Amount', value: pendingAmount, type: 'currency' },
    { label: 'Cleared Amount', value: clearedAmount, type: 'currency' },
    { label: 'Total Records', value: bankPdcData.length, type: 'number' },
  ];
  
  exportToExcel({
    filename: 'BankPDC_Export_{date}.xlsx',
    sheetName: 'Bank PDC Data',
    columns,
    data: bankPdcData,
    summaries,
    selectedCurrency,
  });
}

/**
 * Future Needs-specific export configuration
 */
export function exportFutureNeedsData(
  futureNeedsData: any[],
  selectedCurrency: Currency
): void {
  const columns: ExportColumn[] = [
    { key: 'date', header: 'Date', type: 'date', width: 12 },
    { key: 'description', header: 'Description', type: 'text', width: 30 },
    { key: 'amount', header: 'Amount', type: 'currency', width: 15 },
    { key: 'priority', header: 'Priority', type: 'text', width: 12 },
    { key: 'status', header: 'Status', type: 'text', width: 12 },
    { key: 'currency', header: 'Original Currency', type: 'text', width: 10 },
  ];
  
  // Calculate summaries
  const totalAmount = futureNeedsData.reduce((sum, need) => {
    const convertedAmount = convertCurrency(need.amount, need.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const highPriorityAmount = futureNeedsData
    .filter(need => need.priority === 'high')
    .reduce((sum, need) => {
      const convertedAmount = convertCurrency(need.amount, need.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const mediumPriorityAmount = futureNeedsData
    .filter(need => need.priority === 'medium')
    .reduce((sum, need) => {
      const convertedAmount = convertCurrency(need.amount, need.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const lowPriorityAmount = futureNeedsData
    .filter(need => need.priority === 'low')
    .reduce((sum, need) => {
      const convertedAmount = convertCurrency(need.amount, need.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const summaries: ExportSummary[] = [
    { label: 'Total Amount', value: totalAmount, type: 'currency' },
    { label: 'High Priority Amount', value: highPriorityAmount, type: 'currency' },
    { label: 'Medium Priority Amount', value: mediumPriorityAmount, type: 'currency' },
    { label: 'Low Priority Amount', value: lowPriorityAmount, type: 'currency' },
    { label: 'Total Records', value: futureNeedsData.length, type: 'number' },
  ];
  
  exportToExcel({
    filename: 'FutureNeeds_Export_{date}.xlsx',
    sheetName: 'Future Needs Data',
    columns,
    data: futureNeedsData,
    summaries,
    selectedCurrency,
  });
}

/**
 * Business in Hand-specific export configuration
 */
export function exportBusinessInHandData(
  businessData: any[],
  selectedCurrency: Currency
): void {
  const columns: ExportColumn[] = [
    { key: 'date', header: 'Date', type: 'date', width: 12 },
    { key: 'description', header: 'Description', type: 'text', width: 30 },
    { key: 'amount', header: 'Amount', type: 'currency', width: 15 },
    { key: 'status', header: 'Status', type: 'text', width: 12 },
    { key: 'currency', header: 'Original Currency', type: 'text', width: 10 },
  ];
  
  // Calculate summaries
  const totalAmount = businessData.reduce((sum, business) => {
    const convertedAmount = convertCurrency(business.amount, business.currency, selectedCurrency);
    return sum + convertedAmount;
  }, 0);
  
  const confirmedAmount = businessData
    .filter(business => business.status === 'confirmed')
    .reduce((sum, business) => {
      const convertedAmount = convertCurrency(business.amount, business.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const receivedAmount = businessData
    .filter(business => business.status === 'received')
    .reduce((sum, business) => {
      const convertedAmount = convertCurrency(business.amount, business.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const pendingAmount = businessData
    .filter(business => business.status === 'pending')
    .reduce((sum, business) => {
      const convertedAmount = convertCurrency(business.amount, business.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const summaries: ExportSummary[] = [
    { label: 'Total Amount', value: totalAmount, type: 'currency' },
    { label: 'Confirmed Amount', value: confirmedAmount, type: 'currency' },
    { label: 'Received Amount', value: receivedAmount, type: 'currency' },
    { label: 'Pending Amount', value: pendingAmount, type: 'currency' },
    { label: 'Total Records', value: businessData.length, type: 'number' },
  ];
  
  exportToExcel({
    filename: 'BusinessInHand_Export_{date}.xlsx',
    sheetName: 'Business in Hand Data',
    columns,
    data: businessData,
    summaries,
    selectedCurrency,
  });
}

/**
 * Cash Flow-specific export configuration
 */
export function exportCashFlowData(
  cashFlowData: any[],
  selectedCurrency: Currency
): void {
  const columns: ExportColumn[] = [
    { key: 'date', header: 'Date', type: 'date', width: 12 },
    { key: 'type', header: 'Type', type: 'text', width: 12 },
    { key: 'category', header: 'Category', type: 'text', width: 15 },
    { key: 'description', header: 'Description', type: 'text', width: 30 },
    { key: 'amount', header: 'Amount', type: 'currency', width: 15 },
    { key: 'currency', header: 'Original Currency', type: 'text', width: 10 },
  ];
  
  // Calculate summaries
  const totalInflow = cashFlowData
    .filter(item => item.type === 'Inflow')
    .reduce((sum, item) => {
      const convertedAmount = convertCurrency(Math.abs(item.amount), item.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const totalOutflow = cashFlowData
    .filter(item => item.type === 'Outflow')
    .reduce((sum, item) => {
      const convertedAmount = convertCurrency(Math.abs(item.amount), item.currency, selectedCurrency);
      return sum + convertedAmount;
    }, 0);
  
  const netCashFlow = totalInflow - totalOutflow;
  
  const summaries: ExportSummary[] = [
    { label: 'Total Inflow', value: totalInflow, type: 'currency' },
    { label: 'Total Outflow', value: totalOutflow, type: 'currency' },
    { label: 'Net Cash Flow', value: netCashFlow, type: 'currency' },
    { label: 'Total Records', value: cashFlowData.length, type: 'number' },
  ];
  
  exportToExcel({
    filename: 'CashFlow_Export_{date}.xlsx',
    sheetName: 'Cash Flow Data',
    columns,
    data: cashFlowData,
    summaries,
    selectedCurrency,
  });
}