"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailyData } from "@/lib/data";
import HeroStats from "./components/HeroStats";
import MnavChart from "./components/MnavChart";
import PriceChart from "./components/PriceChart";
import MarketCapChart from "./components/MarketCapChart";
import DataTable from "./components/DataTable";
import AiInsights from "./components/AiInsights";

const RANGE_OPTIONS = [
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "180D", value: 180 },
  { label: "1Y", value: 365 },
  { label: "2Y", value: 730 },
  { label: "All", value: 9999 },
];

export default function Home() {
  const [data, setData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(365);
  const [isFallback, setIsFallback] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mstr-data?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setData(json.data);
      setIsFallback(json.fallback);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {isFallback && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg px-4 py-3 text-sm text-amber-300">
          ⚠️ Using cached fallback data. Live API may be temporarily unavailable.
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Hero Stats */}
      <section>
        <HeroStats data={data} loading={loading} />
      </section>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Market Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Interactive charts with historical data
          </p>
        </div>
        <div className="flex gap-1 bg-gray-900/80 rounded-lg p-1 border border-gray-800">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setDays(o.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                days === o.value
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-gray-900/50 rounded-2xl border border-gray-800 h-96 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <MnavChart data={data} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketCapChart data={data} />
            <PriceChart data={data} />
          </div>
        </div>
      )}

      {/* AI Insights */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Insights
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            GPT-4o powered analysis of current trends
          </p>
        </div>
        <AiInsights data={data} />
      </section>

      {/* Historical Data Table */}
      {!loading && data.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Historical Data
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sortable table with all metrics · {data.length} data points
            </p>
          </div>
          <DataTable data={data} />
        </section>
      )}

      {/* Last Updated */}
      {latest && (
        <div className="text-center text-xs text-gray-600 pb-4">
          Last data point: {latest.date} · Updated {new Date().toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
