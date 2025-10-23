// Currency conversion utilities with proper exchange rates

export const EXCHANGE_RATES = {
  USD_TO_SAR: 3.75,
  USD_TO_AED: 3.67,
  SAR_TO_USD: 1 / 3.75,
  AED_TO_USD: 1 / 3.67,
  SAR_TO_AED: 3.67 / 3.75,
  AED_TO_SAR: 3.75 / 3.67,
};

export type Currency = "USD" | "SAR" | "AED";

export const CURRENCY_SYMBOLS = {
  USD: "$",
  SAR: "ê", // Saudi Riyal symbol (using custom font) - Unicode character EA
  AED: "د.إ", // UAE Dirham symbol
};

export const CURRENCY_NAMES = {
  USD: "US Dollar",
  SAR: "Saudi Riyal", 
  AED: "UAE Dirham",
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  // Handle undefined, null, or NaN values
  const safeAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;
  

  
  if (fromCurrency === toCurrency) {
    return safeAmount;
  }

  // Convert to USD first if needed
  let usdAmount = safeAmount;
  if (fromCurrency === "SAR") {
    usdAmount = safeAmount * EXCHANGE_RATES.SAR_TO_USD;
  } else if (fromCurrency === "AED") {
    usdAmount = safeAmount * EXCHANGE_RATES.AED_TO_USD;
  }

  // Convert from USD to target currency
  let result = usdAmount;
  if (toCurrency === "USD") {
    result = usdAmount;
  } else if (toCurrency === "SAR") {
    result = usdAmount * EXCHANGE_RATES.USD_TO_SAR;
  } else if (toCurrency === "AED") {
    result = usdAmount * EXCHANGE_RATES.USD_TO_AED;
  }


  return result;
}

/**
 * Format currency amount with proper symbol and formatting
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
    useCustomFont?: boolean;
  } = {}
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    useCustomFont = false,
  } = options;

  // Handle undefined, null, or NaN values
  const safeAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;

  const formattedAmount = safeAmount.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  if (!showSymbol) {
    return formattedAmount;
  }

  const symbol = CURRENCY_SYMBOLS[currency];

  // For Arabic currencies, put symbol after the number
  if (currency === "SAR" || currency === "AED") {
    if (useCustomFont && currency === "SAR") {
      // For SAR with custom font, return amount with symbol - CSS class will apply custom font
      return `${formattedAmount} ${symbol}`;
    }
    return `${formattedAmount} ${symbol}`;
  } else {
    return `${symbol}${formattedAmount}`;
  }
}

/**
 * Get formatted currency components for custom font rendering
 */
export function getFormattedCurrencyComponents(
  amount: number,
  currency: Currency,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): { amount: string; symbol: string; useCustomClass?: boolean } {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const safeAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;

  const formattedAmount = safeAmount.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  if (currency === "SAR") {
    return {
      amount: formattedAmount,
      symbol: "ê",
      useCustomClass: true
    };
  } else {
    return {
      amount: formattedAmount,
      symbol: CURRENCY_SYMBOLS[currency],
      useCustomClass: false
    };
  }
}

/**
 * Convert and format currency amount for display
 */
export function convertAndFormatCurrency(
  amount: number,
  originalCurrency: Currency,
  targetCurrency: Currency,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  }
): string {
  const convertedAmount = convertCurrency(amount, originalCurrency, targetCurrency);
  return formatCurrency(convertedAmount, targetCurrency, options);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}

/**
 * Parse currency string to get numeric value
 */
export function parseCurrencyString(currencyString: string): number {
  // Remove all non-numeric characters except decimal point and minus sign
  const numericString = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(numericString) || 0;
}

/**
 * Validate currency code
 */
export function isValidCurrency(currency: string): currency is Currency {
  return currency === "USD" || currency === "SAR" || currency === "AED";
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return ["USD", "SAR", "AED"];
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return 1;
  
  const key = `${fromCurrency}_TO_${toCurrency}` as keyof typeof EXCHANGE_RATES;
  return EXCHANGE_RATES[key] || 1;
}

/**
 * Format amount with conversion to selected currency (single currency display only)
 */
export function formatAmountWithOriginal(
  amount: number,
  originalCurrency: Currency,
  selectedCurrency: Currency
): string {
  const convertedAmount = convertCurrency(amount, originalCurrency, selectedCurrency);
  return formatCurrency(convertedAmount, selectedCurrency);
}
