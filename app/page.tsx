"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailyData } from "@/lib/data";
import CurrentStats from "./components/CurrentStats";
import MnavChart from "./components/MnavChart";
import PriceChart from "./components/PriceChart";
import DateRangeSelector from "./components/DateRangeSelector";
import AiInsights from "./components/AiInsights";

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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {isFallback && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg px-4 py-3 text-sm text-amber-300">
          ⚠️ Using cached fallback data. Live API may be temporarily unavailable.
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CurrentStats data={data} loading={loading} />
        <DateRangeSelector days={days} onChange={setDays} />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-xl border border-gray-800 h-80 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MnavChart data={data} />
          <PriceChart data={data} />
        </div>
      )}

      <AiInsights data={data} />
    </div>
  );
}
