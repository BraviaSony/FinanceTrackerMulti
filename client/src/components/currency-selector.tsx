import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { getFormattedCurrencyComponents, type Currency } from "@/lib/currency-utils";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "SAR", symbol: "ê", name: "Saudi Riyal" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
] as const;

export function CurrencySelector() {
  const currencySettings = useQuery(api.currency.getCurrencySettings);
  const updateCurrency = useMutation(api.currency.updateCurrencySettings);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCurrencyChange = async (currency: "USD" | "SAR" | "AED") => {
    if (currencySettings?.selectedCurrency === currency) return;
    
    setIsUpdating(true);
    try {
      await updateCurrency({ selectedCurrency: currency });
      toast.success(`Currency changed to ${currency}`);
    } catch (error) {
      toast.error("Failed to update currency");
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedCurrency = currencySettings?.selectedCurrency || "USD";
  const selectedCurrencyInfo = currencies.find(c => c.code === selectedCurrency);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isUpdating}
        >
          {selectedCurrencyInfo && (
            <span className={`font-medium ${selectedCurrency === 'SAR' ? 'sar-symbol' : ''}`}>
              {selectedCurrencyInfo.symbol}
            </span>
          )}
          <span className="font-medium">{selectedCurrency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencyChange(currency.code)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{currency.code}</span>
              <span className={`text-muted-foreground ${currency.code === 'SAR' ? 'sar-symbol' : ''}`}>
                {currency.symbol}
              </span>
              <span className="text-sm text-muted-foreground">{currency.name}</span>
            </div>
            {selectedCurrency === currency.code && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
