import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = process.env.GITHUB_TOKEN;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    const { data } = await request.json();

    const recent = (data || []).slice(-30);
    const summary = recent
      .map(
        (d: any) =>
          `${d.date}: mNAV=${d.mNAV}, MSTR=$${d.mstrPrice}, BTC=$${Math.round(d.btcPrice)}`
      )
      .join("\n");

    const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a financial analyst specializing in Bitcoin treasury companies. Analyze mNAV (market cap / BTC NAV) trends. Be concise, insightful, and actionable. Use 3-5 bullet points.",
          },
          {
            role: "user",
            content: `Analyze the recent MicroStrategy (MSTR) mNAV trend data:\n\n${summary}\n\nProvide trend analysis, key observations, and what this means for investors.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error: ${err}`);
    }

    const result = await res.json();
    const content = result.choices?.[0]?.message?.content || "No analysis available.";
    return NextResponse.json({ summary: content });
  } catch (error: any) {
    console.error("AI summary error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate AI summary" },
      { status: 500 }
    );
  }
}
