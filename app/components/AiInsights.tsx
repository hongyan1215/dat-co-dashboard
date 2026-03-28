"use client";

import { useState } from "react";
import type { DailyData } from "@/lib/data";

interface Props {
  data: DailyData[];
}

export default function AiInsights({ data }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setSummary(json.summary);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <span className="text-base">✨</span> AI Insights
        </h2>
        <button
          onClick={generate}
          disabled={loading || data.length === 0}
          className="px-4 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyzing..." : "Generate Analysis"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {summary ? (
        <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed">
          {summary}
        </div>
      ) : !loading ? (
        <p className="text-sm text-gray-600">
          Click &quot;Generate Analysis&quot; to get AI-powered insights on
          current mNAV trends. Requires OPENAI_API_KEY.
        </p>
      ) : (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-4 bg-gray-800 rounded animate-pulse"
              style={{ width: `${80 - i * 15}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
