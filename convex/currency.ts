import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Fixed exchange rates as specified
const EXCHANGE_RATES = {
  USD_TO_SAR: 3.75,
  USD_TO_AED: 3.67,
};

// Get user's currency settings
export const getCurrencySettings = query({
  args: {},
  returns: v.object({
    selectedCurrency: v.union(v.literal("USD"), v.literal("SAR"), v.literal("AED")),
    exchangeRates: v.object({
      USD_TO_SAR: v.number(),
      USD_TO_AED: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("currencySettings")
      .first();

    if (!settings) {
      // Return default settings
      return {
        selectedCurrency: "USD" as const,
        exchangeRates: EXCHANGE_RATES,
      };
    }

    return {
      selectedCurrency: settings.selectedCurrency,
      exchangeRates: EXCHANGE_RATES,
    };
  },
});

// Update currency settings
export const updateCurrencySettings = mutation({
  args: {
    selectedCurrency: v.union(v.literal("USD"), v.literal("SAR"), v.literal("AED")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("currencySettings")
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        selectedCurrency: args.selectedCurrency,
        exchangeRates: EXCHANGE_RATES,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("currencySettings", {
        selectedCurrency: args.selectedCurrency,
        exchangeRates: EXCHANGE_RATES,
        updatedAt: now,
      });
    }

    return null;
  },
});

// Convert amount from one currency to another
export const convertCurrency = query({
  args: {
    amount: v.number(),
    fromCurrency: v.union(v.literal("USD"), v.literal("SAR"), v.literal("AED")),
    toCurrency: v.union(v.literal("USD"), v.literal("SAR"), v.literal("AED")),
  },
  returns: v.number(),
  handler: async (_, args) => {
    if (args.fromCurrency === args.toCurrency) {
      return args.amount;
    }

    // Convert to USD first if needed
    let usdAmount = args.amount;
    if (args.fromCurrency === "SAR") {
      usdAmount = args.amount / EXCHANGE_RATES.USD_TO_SAR;
    } else if (args.fromCurrency === "AED") {
      usdAmount = args.amount / EXCHANGE_RATES.USD_TO_AED;
    }

    // Convert from USD to target currency
    if (args.toCurrency === "USD") {
      return usdAmount;
    } else if (args.toCurrency === "SAR") {
      return usdAmount * EXCHANGE_RATES.USD_TO_SAR;
    } else if (args.toCurrency === "AED") {
      return usdAmount * EXCHANGE_RATES.USD_TO_AED;
    }

    return usdAmount;
  },
});

// Get all amounts converted to user's selected currency
export const getConvertedAmount = query({
  args: {
    amount: v.number(),
    originalCurrency: v.union(v.literal("USD"), v.literal("SAR"), v.literal("AED")),
  },
  returns: v.object({
    convertedAmount: v.number(),
    selectedCurrency: v.union(v.literal("USD"), v.literal("SAR"), v.literal("AED")),
  }),
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("currencySettings")
      .first();

    const selectedCurrency = settings?.selectedCurrency || "USD";

    if (args.originalCurrency === selectedCurrency) {
      return {
        convertedAmount: args.amount,
        selectedCurrency,
      };
    }

    // Convert to USD first if needed
    let usdAmount = args.amount;
    if (args.originalCurrency === "SAR") {
      usdAmount = args.amount / EXCHANGE_RATES.USD_TO_SAR;
    } else if (args.originalCurrency === "AED") {
      usdAmount = args.amount / EXCHANGE_RATES.USD_TO_AED;
    }

    // Convert from USD to selected currency
    let convertedAmount = usdAmount;
    if (selectedCurrency === "SAR") {
      convertedAmount = usdAmount * EXCHANGE_RATES.USD_TO_SAR;
    } else if (selectedCurrency === "AED") {
      convertedAmount = usdAmount * EXCHANGE_RATES.USD_TO_AED;
    }

    return {
      convertedAmount,
      selectedCurrency,
    };
  },
});

// Get exchange rates
export const getExchangeRates = query({
  args: {},
  returns: v.object({
    USD_TO_SAR: v.number(),
    USD_TO_AED: v.number(),
    SAR_TO_USD: v.number(),
    AED_TO_USD: v.number(),
    SAR_TO_AED: v.number(),
    AED_TO_SAR: v.number(),
  }),
  handler: async (_) => {
    return {
      USD_TO_SAR: EXCHANGE_RATES.USD_TO_SAR,
      USD_TO_AED: EXCHANGE_RATES.USD_TO_AED,
      SAR_TO_USD: 1 / EXCHANGE_RATES.USD_TO_SAR,
      AED_TO_USD: 1 / EXCHANGE_RATES.USD_TO_AED,
      SAR_TO_AED: EXCHANGE_RATES.USD_TO_AED / EXCHANGE_RATES.USD_TO_SAR,
      AED_TO_SAR: EXCHANGE_RATES.USD_TO_SAR / EXCHANGE_RATES.USD_TO_AED,
    };
  },
});