import { NextResponse } from "next/server";
import {
  fetchBtcPrices,
  fetchMstrData,
  getBtcHoldings,
  calculateMNAV,
  FALLBACK_DATA,
  type DailyData,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "365", 10);

  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    const period1 = start.toISOString().split("T")[0];
    const period2 = now.toISOString().split("T")[0];

    const [btcPrices, mstrEntries] = await Promise.all([
      fetchBtcPrices(days),
      fetchMstrData(period1, period2),
    ]);

    const btcMap = new Map(btcPrices.map((b) => [b.date, b.price]));

    const results: DailyData[] = [];
    for (const m of mstrEntries) {
      const btcPrice = btcMap.get(m.date);
      if (!btcPrice) continue;
      const holdings = getBtcHoldings(m.date);
      const mNAV = calculateMNAV(m.marketCap, holdings, btcPrice);
      results.push({
        date: m.date,
        mstrPrice: m.close,
        mstrMarketCap: m.marketCap,
        btcPrice,
        btcHoldings: holdings,
        mNAV: Math.round(mNAV * 100) / 100,
      });
    }

    if (results.length === 0) {
      return NextResponse.json({ data: FALLBACK_DATA, fallback: true });
    }

    return NextResponse.json({ data: results, fallback: false });
  } catch (error: any) {
    console.error("API error:", error?.message || error);
    return NextResponse.json({ data: FALLBACK_DATA, fallback: true });
  }
}
