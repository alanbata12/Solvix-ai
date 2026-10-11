export type MarketBar = {
  close: number;
  timestamp?: string | number;
};

export type SentinelSignal = {
  symbol: string;
  direction: "UPTREND" | "DOWNTREND" | "MIXED";
  confidence: "LOW" | "MODERATE";
  sampleSize: number;
  latestClose: number;
  changePercent: number;
  note: string;
};

const SYMBOL_PATTERN = /^[A-Z0-9._-]{2,24}$/;

/**
 * Creates a descriptive, non-executable market summary from supplied bars.
 * This helper does not fetch prices, promise returns, or place trades.
 */
export class SentinelSignalGenerator {
  analyze(symbolInput: string, bars: MarketBar[]): SentinelSignal | null {
    const symbol = symbolInput.trim().toUpperCase();
    if (!SYMBOL_PATTERN.test(symbol) || !Array.isArray(bars) || bars.length < 3) return null;

    const closes = bars.map((bar) => bar?.close);
    if (closes.some((value) => typeof value !== "number" || !Number.isFinite(value) || value <= 0)) {
      return null;
    }

    const first = closes[0];
    const latest = closes[closes.length - 1];
    const changePercent = ((latest - first) / first) * 100;
    const direction = changePercent > 0.15 ? "UPTREND" : changePercent < -0.15 ? "DOWNTREND" : "MIXED";

    return {
      symbol,
      direction,
      confidence: bars.length >= 20 ? "MODERATE" : "LOW",
      sampleSize: bars.length,
      latestClose: latest,
      changePercent: Number(changePercent.toFixed(4)),
      note: "Informational summary only; not financial advice and not a trade instruction.",
    };
  }
}
