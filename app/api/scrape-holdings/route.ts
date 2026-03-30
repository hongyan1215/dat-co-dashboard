import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export interface PurchaseEntry {
  date_of_purchase: string;
  btc_holdings: number;
  assumed_diluted_shares_outstanding: number;
}

/**
 * Scrapes strategy.com/purchases for BTC holdings and shares outstanding data.
 * The page embeds all purchase data in __NEXT_DATA__ JSON.
 */
export async function GET() {
  try {
    const res = await fetch("https://www.strategy.com/purchases", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch strategy.com: ${res.status}`);
    }

    const html = await res.text();

    // Extract __NEXT_DATA__ JSON
    const startTag = '<script id="__NEXT_DATA__" type="application/json">';
    const startIdx = html.indexOf(startTag);
    const endTag = '</script>';
    const endIdx = startIdx >= 0 ? html.indexOf(endTag, startIdx + startTag.length) : -1;
    const match = startIdx >= 0 && endIdx >= 0
      ? [null, html.substring(startIdx + startTag.length, endIdx)]
      : null;
    if (!match?.[1]) {
      throw new Error("Could not find __NEXT_DATA__ in page");
    }

    const nextData = JSON.parse(match[1]);
    const purchases: any[] =
      nextData?.props?.pageProps?.purchases || [];

    if (purchases.length === 0) {
      throw new Error("No purchase data found in __NEXT_DATA__");
    }

    const entries: PurchaseEntry[] = purchases
      .filter(
        (p: any) =>
          p.date_of_purchase &&
          p.btc_holdings != null &&
          p.assumed_diluted_shares_outstanding != null
      )
      .map((p: any) => ({
        date_of_purchase: p.date_of_purchase,
        btc_holdings: p.btc_holdings,
        assumed_diluted_shares_outstanding:
          p.assumed_diluted_shares_outstanding,
      }))
      .sort(
        (a: PurchaseEntry, b: PurchaseEntry) =>
          a.date_of_purchase.localeCompare(b.date_of_purchase)
      );

    return NextResponse.json({
      success: true,
      count: entries.length,
      lastUpdated: new Date().toISOString(),
      data: entries,
    });
  } catch (error: any) {
    console.error("Scrape error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
