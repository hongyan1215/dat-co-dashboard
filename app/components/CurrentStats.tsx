"use client";

import type { DailyData } from "@/lib/data";

interface Props {
  data: DailyData[];
  loading: boolean;
}

export default function CurrentStats({ data, loading }: Props) {
  if (loading || data.length === 0) {
    return (
      <div className="flex gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-xl border border-gray-800 px-5 py-4 w-40 h-20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const latest = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : latest;
  const mnavChange = latest.mNAV - prev.mNAV;
  const isPremium = latest.mNAV >= 1;

  return (
    <div className="flex flex-wrap gap-3">
      <div
        className={`rounded-xl border px-5 py-4 ${
          isPremium
            ? "bg-emerald-950/40 border-emerald-800/50"
            : "bg-red-950/40 border-red-800/50"
        }`}
      >
        <p className="text-xs text-gray-400 mb-1">Current mNAV</p>
        <p
          className={`text-2xl font-bold ${
            isPremium ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {latest.mNAV.toFixed(2)}x
        </p>
        <p
          className={`text-xs mt-1 ${
            mnavChange >= 0 ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {mnavChange >= 0 ? "▲" : "▼"} {Math.abs(mnavChange).toFixed(2)}
        </p>
      </div>
      <div className="bg-gray-900 rounded-xl border border-gray-800 px-5 py-4">
        <p className="text-xs text-gray-400 mb-1">MSTR Price</p>
        <p className="text-2xl font-bold">
          ${latest.mstrPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs text-gray-500 mt-1">{latest.date}</p>
      </div>
      <div className="bg-gray-900 rounded-xl border border-gray-800 px-5 py-4">
        <p className="text-xs text-gray-400 mb-1">BTC Price</p>
        <p className="text-2xl font-bold text-amber-400">
          ${latest.btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {latest.btcHoldings.toLocaleString()} BTC held
        </p>
      </div>
    </div>
  );
}
