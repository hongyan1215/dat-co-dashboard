export interface DailyData {
  date: string;
  mstrPrice: number;
  mstrMarketCap: number;
  btcPrice: number;
  btcHoldings: number;
  mNAV: number;
}

// Fallback BTC holdings (used when scraper is unavailable)
const FALLBACK_BTC_HOLDINGS: { date: string; holdings: number }[] = [
  { date: "2023-01-01", holdings: 132500 },
  { date: "2023-04-01", holdings: 140000 },
  { date: "2023-07-01", holdings: 152800 },
  { date: "2023-10-01", holdings: 158245 },
  { date: "2024-01-01", holdings: 189150 },
  { date: "2024-03-01", holdings: 205000 },
  { date: "2024-04-01", holdings: 214246 },
  { date: "2024-07-01", holdings: 226500 },
  { date: "2024-09-01", holdings: 252220 },
  { date: "2024-11-01", holdings: 331200 },
  { date: "2024-12-01", holdings: 386700 },
  { date: "2025-01-01", holdings: 450000 },
  { date: "2025-02-01", holdings: 471107 },
  { date: "2025-03-01", holdings: 499096 },
  { date: "2025-06-01", holdings: 506137 },
  { date: "2025-08-11", holdings: 629376 },
  { date: "2025-09-02", holdings: 636505 },
  { date: "2025-09-29", holdings: 640031 },
  { date: "2025-10-13", holdings: 640250 },
  { date: "2025-11-03", holdings: 641205 },
  { date: "2025-11-17", holdings: 649870 },
  { date: "2025-12-01", holdings: 650000 },
  { date: "2025-12-08", holdings: 660624 },
  { date: "2025-12-15", holdings: 671268 },
  { date: "2025-12-29", holdings: 672497 },
  { date: "2025-12-31", holdings: 672500 },
  { date: "2026-01-05", holdings: 673783 },
  { date: "2026-01-12", holdings: 687410 },
  { date: "2026-01-20", holdings: 709715 },
  { date: "2026-01-26", holdings: 712647 },
  { date: "2026-02-02", holdings: 713502 },
  { date: "2026-02-09", holdings: 714644 },
  { date: "2026-02-17", holdings: 717131 },
  { date: "2026-02-23", holdings: 717722 },
  { date: "2026-03-02", holdings: 720737 },
  { date: "2026-03-09", holdings: 738731 },
  { date: "2026-03-16", holdings: 761068 },
  { date: "2026-03-23", holdings: 762099 },
];

// Fallback shares outstanding (used when scraper is unavailable)
const FALLBACK_SHARES: { date: string; shares: number }[] = [
  { date: "2024-08-08", shares: 166900000 },
  { date: "2024-10-01", shares: 182000000 },
  { date: "2025-01-01", shares: 218500000 },
  { date: "2025-06-01", shares: 244000000 },
  { date: "2025-08-18", shares: 316727000 },
  { date: "2025-08-25", shares: 317624000 },
  { date: "2025-09-02", shares: 318877000 },
  { date: "2025-09-15", shares: 319500000 },
  { date: "2025-09-29", shares: 320094000 },
  { date: "2025-11-03", shares: 320277000 },
  { date: "2025-11-17", shares: 320283000 },
  { date: "2025-12-01", shares: 328510000 },
  { date: "2025-12-08", shares: 333631000 },
  { date: "2025-12-15", shares: 338444000 },
  { date: "2025-12-29", shares: 343641000 },
  { date: "2025-12-31", shares: 344897000 },
  { date: "2026-01-05", shares: 345632000 },
  { date: "2026-01-12", shares: 352204000 },
  { date: "2026-01-20", shares: 362606000 },
  { date: "2026-01-26", shares: 364173000 },
  { date: "2026-02-02", shares: 364845000 },
  { date: "2026-02-09", shares: 365461000 },
  { date: "2026-02-23", shares: 366419000 },
  { date: "2026-03-02", shares: 368154000 },
  { date: "2026-03-09", shares: 374506000 },
  { date: "2026-03-16", shares: 377340000 },
];

// Cache for scraped data
let _scrapedHoldings: { date: string; holdings: number }[] | null = null;
let _scrapedShares: { date: string; shares: number }[] | null = null;
let _lastScrapeTime = 0;
const SCRAPE_CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours

async function fetchScrapedData(): Promise<{
  holdings: { date: string; holdings: number }[];
  shares: { date: string; shares: number }[];
} | null> {
  const now = Date.now();
  if (_scrapedHoldings && _scrapedShares && now - _lastScrapeTime < SCRAPE_CACHE_MS) {
    return { holdings: _scrapedHoldings, shares: _scrapedShares };
  }

  try {
    const res = await fetch("https://www.strategy.com/purchases", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const startTag = '<script id="__NEXT_DATA__" type="application/json">';
    const startIdx = html.indexOf(startTag);
    const endTag = '</script>';
    const endIdx = startIdx >= 0 ? html.indexOf(endTag, startIdx + startTag.length) : -1;
    const match = startIdx >= 0 && endIdx >= 0
      ? [null, html.substring(startIdx + startTag.length, endIdx)]
      : null;
    if (!match?.[1]) return null;

    const nextData = JSON.parse(match[1]);
    const purchases: any[] = nextData?.props?.pageProps?.purchases || [];
    if (purchases.length === 0) return null;

    const holdings = purchases
      .filter((p: any) => p.date_of_purchase && p.btc_holdings != null)
      .map((p: any) => ({
        date: p.date_of_purchase,
        holdings: p.btc_holdings as number,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const shares = purchases
      .filter((p: any) => p.date_of_purchase && p.assumed_diluted_shares_outstanding != null)
      .map((p: any) => ({
        date: p.date_of_purchase,
        shares: p.assumed_diluted_shares_outstanding as number,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    _scrapedHoldings = holdings;
    _scrapedShares = shares;
    _lastScrapeTime = now;
    console.log(`[scraper] Updated from strategy.com: ${holdings.length} holdings, ${shares.length} shares entries`);
    return { holdings, shares };
  } catch (e) {
    console.error("[scraper] Failed to scrape strategy.com:", e);
    return null;
  }
}

// Merged timeline: scraped data takes priority, fallback fills gaps
async function getBtcHoldingsTimeline(): Promise<{ date: string; holdings: number }[]> {
  const scraped = await fetchScrapedData();
  if (!scraped) return FALLBACK_BTC_HOLDINGS;

  // Merge: use fallback for older dates not in scraped data, then scraped
  const scrapedDates = new Set(scraped.holdings.map((h) => h.date));
  const fallbackOnly = FALLBACK_BTC_HOLDINGS.filter((f) => !scrapedDates.has(f.date));
  return [...fallbackOnly, ...scraped.holdings].sort((a, b) => a.date.localeCompare(b.date));
}

async function getSharesTimeline(): Promise<{ date: string; shares: number }[]> {
  const scraped = await fetchScrapedData();
  if (!scraped) return FALLBACK_SHARES;

  const scrapedDates = new Set(scraped.shares.map((s) => s.date));
  const fallbackOnly = FALLBACK_SHARES.filter((f) => !scrapedDates.has(f.date));
  return [...fallbackOnly, ...scraped.shares].sort((a, b) => a.date.localeCompare(b.date));
}

export async function getBtcHoldings(dateStr: string): Promise<number> {
  const timeline = await getBtcHoldingsTimeline();
  let holdings = timeline[0].holdings;
  for (const entry of timeline) {
    if (dateStr >= entry.date) {
      holdings = entry.holdings;
    } else break;
  }
  return holdings;
}

// Shares outstanding (post 10:1 split on 2024-08-08)
// ADSO from https://www.strategy.com/purchases
async function getSharesOutstanding(dateStr: string): Promise<number> {
  const timeline = await getSharesTimeline();
  // Default for pre-split dates
  if (dateStr < timeline[0]?.date) return 166900000;
  let shares = timeline[0].shares;
  for (const entry of timeline) {
    if (dateStr >= entry.date) {
      shares = entry.shares;
    } else break;
  }
  return shares;
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
    price: Math.round(price),
  }));
}

// Use Yahoo Finance v8 chart API directly (no npm package needed)
export async function fetchMstrData(
  period1: string,
  period2: string
): Promise<{ date: string; close: number; marketCap: number }[]> {
  const p1 = Math.floor(new Date(period1).getTime() / 1000);
  const p2 = Math.floor(new Date(period2).getTime() / 1000);
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/MSTR?period1=${p1}&period2=${p2}&interval=1d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 3600 },
  });
  
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error("No Yahoo data");
  
  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  
  const entries = await Promise.all(
    timestamps.map(async (ts: number, i: number) => {
      const close = closes[i];
      if (close == null) return null;
      const dateStr = new Date(ts * 1000).toISOString().split("T")[0];
      const shares = await getSharesOutstanding(dateStr);
      return {
        date: dateStr,
        close: Math.round(close * 100) / 100,
        marketCap: close * shares,
      };
    })
  );
  return entries.filter(Boolean) as { date: string; close: number; marketCap: number }[];
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

// Comprehensive fallback data - MSTR prices are split-adjusted (10:1 split 2024-08-08)
export const FALLBACK_DATA: DailyData[] = [
  { date: "2024-01-02", mstrPrice: 68.0, mstrMarketCap: 11.35e9, btcPrice: 45200, btcHoldings: 189150, mNAV: 1.33 },
  { date: "2024-01-15", mstrPrice: 59.0, mstrMarketCap: 9.85e9, btcPrice: 43000, btcHoldings: 189150, mNAV: 1.21 },
  { date: "2024-02-01", mstrPrice: 58.0, mstrMarketCap: 9.68e9, btcPrice: 43000, btcHoldings: 190000, mNAV: 1.19 },
  { date: "2024-02-15", mstrPrice: 75.0, mstrMarketCap: 12.5e9, btcPrice: 52000, btcHoldings: 190000, mNAV: 1.27 },
  { date: "2024-03-01", mstrPrice: 120.0, mstrMarketCap: 20.0e9, btcPrice: 62000, btcHoldings: 205000, mNAV: 1.57 },
  { date: "2024-03-15", mstrPrice: 180.0, mstrMarketCap: 30.0e9, btcPrice: 68000, btcHoldings: 205000, mNAV: 2.15 },
  { date: "2024-04-01", mstrPrice: 170.0, mstrMarketCap: 28.4e9, btcPrice: 70000, btcHoldings: 214246, mNAV: 1.89 },
  { date: "2024-04-15", mstrPrice: 128.0, mstrMarketCap: 21.4e9, btcPrice: 63000, btcHoldings: 214246, mNAV: 1.58 },
  { date: "2024-05-01", mstrPrice: 130.0, mstrMarketCap: 21.7e9, btcPrice: 60000, btcHoldings: 214246, mNAV: 1.69 },
  { date: "2024-05-15", mstrPrice: 156.0, mstrMarketCap: 26.0e9, btcPrice: 66000, btcHoldings: 214246, mNAV: 1.84 },
  { date: "2024-06-01", mstrPrice: 160.0, mstrMarketCap: 26.7e9, btcPrice: 67000, btcHoldings: 226500, mNAV: 1.76 },
  { date: "2024-06-15", mstrPrice: 144.0, mstrMarketCap: 24.0e9, btcPrice: 65000, btcHoldings: 226500, mNAV: 1.63 },
  { date: "2024-07-01", mstrPrice: 145.0, mstrMarketCap: 24.2e9, btcPrice: 63000, btcHoldings: 226500, mNAV: 1.70 },
  { date: "2024-07-15", mstrPrice: 153.0, mstrMarketCap: 25.5e9, btcPrice: 67000, btcHoldings: 226500, mNAV: 1.68 },
  { date: "2024-08-01", mstrPrice: 135.0, mstrMarketCap: 22.5e9, btcPrice: 65000, btcHoldings: 226500, mNAV: 1.53 },
  { date: "2024-08-15", mstrPrice: 129.0, mstrMarketCap: 21.5e9, btcPrice: 59000, btcHoldings: 226500, mNAV: 1.61 },
  { date: "2024-09-01", mstrPrice: 125.0, mstrMarketCap: 20.9e9, btcPrice: 58000, btcHoldings: 252220, mNAV: 1.43 },
  { date: "2024-09-15", mstrPrice: 138.0, mstrMarketCap: 23.0e9, btcPrice: 60000, btcHoldings: 252220, mNAV: 1.52 },
  { date: "2024-10-01", mstrPrice: 180.0, mstrMarketCap: 32.8e9, btcPrice: 64000, btcHoldings: 252220, mNAV: 2.03 },
  { date: "2024-10-15", mstrPrice: 210.0, mstrMarketCap: 38.2e9, btcPrice: 68000, btcHoldings: 252220, mNAV: 2.23 },
  { date: "2024-11-01", mstrPrice: 250.0, mstrMarketCap: 45.5e9, btcPrice: 72000, btcHoldings: 331200, mNAV: 1.91 },
  { date: "2024-11-15", mstrPrice: 340.0, mstrMarketCap: 61.9e9, btcPrice: 90000, btcHoldings: 331200, mNAV: 2.08 },
  { date: "2024-12-01", mstrPrice: 380.0, mstrMarketCap: 69.2e9, btcPrice: 97000, btcHoldings: 386700, mNAV: 1.84 },
  { date: "2024-12-15", mstrPrice: 360.0, mstrMarketCap: 65.5e9, btcPrice: 101000, btcHoldings: 386700, mNAV: 1.68 },
  { date: "2025-01-02", mstrPrice: 330.0, mstrMarketCap: 72.1e9, btcPrice: 96000, btcHoldings: 450000, mNAV: 1.67 },
  { date: "2025-01-15", mstrPrice: 350.0, mstrMarketCap: 76.5e9, btcPrice: 99000, btcHoldings: 450000, mNAV: 1.72 },
  { date: "2025-02-01", mstrPrice: 320.0, mstrMarketCap: 69.9e9, btcPrice: 100000, btcHoldings: 471107, mNAV: 1.48 },
  { date: "2025-02-15", mstrPrice: 310.0, mstrMarketCap: 67.7e9, btcPrice: 97000, btcHoldings: 471107, mNAV: 1.48 },
  { date: "2025-03-01", mstrPrice: 290.0, mstrMarketCap: 63.4e9, btcPrice: 85000, btcHoldings: 499096, mNAV: 1.49 },
  { date: "2025-03-15", mstrPrice: 300.0, mstrMarketCap: 65.6e9, btcPrice: 84000, btcHoldings: 499096, mNAV: 1.56 },
  { date: "2025-04-01", mstrPrice: 310.0, mstrMarketCap: 67.7e9, btcPrice: 82000, btcHoldings: 499096, mNAV: 1.65 },
  { date: "2025-05-01", mstrPrice: 340.0, mstrMarketCap: 74.3e9, btcPrice: 95000, btcHoldings: 499096, mNAV: 1.57 },
  { date: "2025-06-01", mstrPrice: 360.0, mstrMarketCap: 87.8e9, btcPrice: 103000, btcHoldings: 506137, mNAV: 1.68 },
  { date: "2025-07-01", mstrPrice: 320.0, mstrMarketCap: 78.1e9, btcPrice: 98000, btcHoldings: 506137, mNAV: 1.57 },
  { date: "2025-08-01", mstrPrice: 280.0, mstrMarketCap: 68.3e9, btcPrice: 91000, btcHoldings: 506137, mNAV: 1.48 },
  { date: "2025-09-01", mstrPrice: 260.0, mstrMarketCap: 82.9e9, btcPrice: 85000, btcHoldings: 636505, mNAV: 1.53 },
  { date: "2025-10-01", mstrPrice: 290.0, mstrMarketCap: 92.8e9, btcPrice: 89000, btcHoldings: 640250, mNAV: 1.63 },
  { date: "2025-11-01", mstrPrice: 310.0, mstrMarketCap: 99.3e9, btcPrice: 92000, btcHoldings: 641205, mNAV: 1.68 },
  { date: "2025-12-01", mstrPrice: 330.0, mstrMarketCap: 108.4e9, btcPrice: 88000, btcHoldings: 650000, mNAV: 1.90 },
  { date: "2025-12-15", mstrPrice: 340.0, mstrMarketCap: 115.1e9, btcPrice: 92000, btcHoldings: 671268, mNAV: 1.86 },
  { date: "2026-01-05", mstrPrice: 295.0, mstrMarketCap: 102.0e9, btcPrice: 90000, btcHoldings: 673783, mNAV: 1.68 },
  { date: "2026-01-20", mstrPrice: 310.0, mstrMarketCap: 112.4e9, btcPrice: 95000, btcHoldings: 709715, mNAV: 1.67 },
  { date: "2026-02-02", mstrPrice: 280.0, mstrMarketCap: 102.2e9, btcPrice: 88000, btcHoldings: 713502, mNAV: 1.63 },
  { date: "2026-02-17", mstrPrice: 250.0, mstrMarketCap: 91.5e9, btcPrice: 68000, btcHoldings: 717131, mNAV: 1.88 },
  { date: "2026-03-02", mstrPrice: 185.0, mstrMarketCap: 68.1e9, btcPrice: 68000, btcHoldings: 720737, mNAV: 1.39 },
  { date: "2026-03-16", mstrPrice: 150.0, mstrMarketCap: 56.6e9, btcPrice: 70000, btcHoldings: 761068, mNAV: 1.06 },
  { date: "2026-03-27", mstrPrice: 126.0, mstrMarketCap: 47.6e9, btcPrice: 68800, btcHoldings: 762099, mNAV: 0.91 },
];
