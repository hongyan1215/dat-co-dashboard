export interface DailyData {
  date: string;
  mstrPrice: number;
  mstrMarketCap: number;
  btcPrice: number;
  btcHoldings: number;
  mNAV: number;
}

// MicroStrategy known BTC holdings over time (approximate milestones)
const BTC_HOLDINGS_TIMELINE: { date: string; holdings: number }[] = [
  { date: "2023-01-01", holdings: 132500 },
  { date: "2023-04-01", holdings: 140000 },
  { date: "2023-07-01", holdings: 152800 },
  { date: "2023-10-01", holdings: 158245 },
  { date: "2024-01-01", holdings: 189150 },
  { date: "2024-04-01", holdings: 214246 },
  { date: "2024-07-01", holdings: 226500 },
  { date: "2024-10-01", holdings: 252220 },
  { date: "2025-01-01", holdings: 450000 },
  { date: "2025-03-01", holdings: 499096 },
  { date: "2026-01-01", holdings: 506137 },
];

export function getBtcHoldings(dateStr: string): number {
  let holdings = BTC_HOLDINGS_TIMELINE[0].holdings;
  for (const entry of BTC_HOLDINGS_TIMELINE) {
    if (dateStr >= entry.date) {
      holdings = entry.holdings;
    } else break;
  }
  return holdings;
}

export async function fetchBtcPrices(
  days: number = 365
): Promise<{ date: string; price: number }[]> {
  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
  const data = await res.json();
  return (data.prices as [number, number][]).map(([ts, price]) => ({
    date: new Date(ts).toISOString().split("T")[0],
    price,
  }));
}

export async function fetchMstrData(
  period1: string,
  period2: string
): Promise<{ date: string; close: number; marketCap: number }[]> {
  const yahooFinance = (await import("yahoo-finance2")).default;

  const quote = await (yahooFinance as any).quote("MSTR");
  const sharesOutstanding = quote?.sharesOutstanding || 16690000;

  const history = await (yahooFinance as any).historical("MSTR", {
    period1,
    period2,
    interval: "1d",
  });

  return (history || [])
    .filter((q: any) => q.close != null)
    .map((q: any) => {
      const close = q.close as number;
      const date = new Date(q.date).toISOString().split("T")[0];
      const marketCap = close * sharesOutstanding;
      return { date, close, marketCap };
    });
}

export function calculateMNAV(
  marketCap: number,
  btcHoldings: number,
  btcPrice: number
): number {
  const nav = btcHoldings * btcPrice;
  if (nav === 0) return 0;
  return marketCap / nav;
}

// Fallback hardcoded data if APIs fail
export const FALLBACK_DATA: DailyData[] = [
  { date: "2024-01-02", mstrPrice: 680, mstrMarketCap: 11e9, btcPrice: 45200, btcHoldings: 189150, mNAV: 1.29 },
  { date: "2024-02-01", mstrPrice: 580, mstrMarketCap: 9.5e9, btcPrice: 43000, btcHoldings: 190000, mNAV: 1.16 },
  { date: "2024-03-01", mstrPrice: 1200, mstrMarketCap: 20e9, btcPrice: 62000, btcHoldings: 205000, mNAV: 1.57 },
  { date: "2024-04-01", mstrPrice: 1700, mstrMarketCap: 28e9, btcPrice: 70000, btcHoldings: 214246, mNAV: 1.87 },
  { date: "2024-05-01", mstrPrice: 1300, mstrMarketCap: 22e9, btcPrice: 60000, btcHoldings: 214246, mNAV: 1.71 },
  { date: "2024-06-01", mstrPrice: 1600, mstrMarketCap: 26e9, btcPrice: 67000, btcHoldings: 226500, mNAV: 1.71 },
  { date: "2024-07-01", mstrPrice: 1450, mstrMarketCap: 24e9, btcPrice: 63000, btcHoldings: 226500, mNAV: 1.68 },
  { date: "2024-08-01", mstrPrice: 1350, mstrMarketCap: 22e9, btcPrice: 65000, btcHoldings: 226500, mNAV: 1.49 },
  { date: "2024-09-01", mstrPrice: 1250, mstrMarketCap: 21e9, btcPrice: 58000, btcHoldings: 252220, mNAV: 1.44 },
  { date: "2024-10-01", mstrPrice: 1800, mstrMarketCap: 30e9, btcPrice: 64000, btcHoldings: 252220, mNAV: 1.86 },
  { date: "2024-11-01", mstrPrice: 2500, mstrMarketCap: 42e9, btcPrice: 72000, btcHoldings: 252220, mNAV: 2.31 },
  { date: "2024-12-01", mstrPrice: 3800, mstrMarketCap: 63e9, btcPrice: 97000, btcHoldings: 386700, mNAV: 1.68 },
  { date: "2025-01-02", mstrPrice: 3300, mstrMarketCap: 78e9, btcPrice: 96000, btcHoldings: 450000, mNAV: 1.81 },
  { date: "2025-02-01", mstrPrice: 3200, mstrMarketCap: 76e9, btcPrice: 100000, btcHoldings: 471107, mNAV: 1.61 },
  { date: "2025-03-01", mstrPrice: 2900, mstrMarketCap: 70e9, btcPrice: 85000, btcHoldings: 499096, mNAV: 1.65 },
];
