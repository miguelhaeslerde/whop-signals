import { z } from "zod";

export const signalFormSchema = z.object({
  side: z.enum(["BUY", "SELL", "BUY_LIMIT", "SELL_LIMIT"]),
  instrument: z.string().min(1, "Instrument is required").max(20, "Instrument too long"),
  entry: z.string().regex(/^\d+\.?\d*$/, "Invalid entry price format"),
  stopLoss: z.string().regex(/^\d+\.?\d*$/, "Invalid stop loss format"),
  takeProfits: z.array(z.object({
    price: z.string().regex(/^\d+\.?\d*$/, "Invalid price format"),
  })).max(5, "Maximum 5 take profit levels"),
  riskTag: z.enum(["SAFE", "NORMAL", "RISKY"]).optional(),
  tradingViewLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().max(500, "Notes too long").optional(),
}).refine((data) => {
  const entry = parseFloat(data.entry);
  const stopLoss = parseFloat(data.stopLoss);
  
  if (entry === stopLoss) {
    return false;
  }
  
  const isLong = data.side === "BUY" || data.side === "BUY_LIMIT";
  
  for (const tp of data.takeProfits) {
    const tpPrice = parseFloat(tp.price);
    
    if (isLong) {
      if (stopLoss >= entry || tpPrice <= entry) {
        return false;
      }
    } else {
      if (stopLoss <= entry || tpPrice >= entry) {
        return false;
      }
    }
  }
  
  return true;
}, {
  message: "Invalid price levels for signal direction"
});

export type SignalFormData = z.infer<typeof signalFormSchema>;

export function calculateRiskReward(
  entry: number,
  stopLoss: number,
  takeProfit: number,
  isLong: boolean
): number {
  const risk = Math.abs(entry - stopLoss);
  let reward: number;
  
  if (isLong) {
    reward = takeProfit - entry;
  } else {
    reward = entry - takeProfit;
  }
  
  return reward / risk;
}

export function validateTradingViewUrl(url: string): boolean {
  if (!url) return true; // Optional field
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("tradingview.com");
  } catch {
    return false;
  }
}

export function formatPrice(price: number, decimals: number = 5): string {
  return price.toFixed(decimals);
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}R`;
}
