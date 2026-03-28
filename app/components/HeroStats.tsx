"use client";

import type { DailyData } from "@/lib/data";

interface Props {
  data: DailyData[];
  loading: boolean;
}

function StatCard({
  label,
  value,
  sub,
  gradient,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  gradient: string;
  valueColor?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-800 p-5 ${gradient}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
      <div className="relative">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </p>
        <p className={`text-3xl font-bold tracking-tight ${valueColor || "text-white"}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-gray-500 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 h-[120px] animate-pulse">
      <div className="h-3 w-20 bg-gray-800 rounded mb-3" />
      <div className="h-8 w-28 bg-gray-800 rounded mb-2" />
      <div className="h-3 w-24 bg-gray-800 rounded" />
    </div>
  );
}

export default function HeroStats({ data, loading }: Props) {
  if (loading || data.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const latest = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : latest;
  const mnavChange = latest.mNAV - prev.mNAV;
  const premiumPct = ((latest.mNAV - 1) * 100).toFixed(1);
  const isPositiveTrend = mnavChange >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        label="mNAV Ratio"
        value={`${latest.mNAV.toFixed(2)}x`}
        sub={`${isPositiveTrend ? "▲" : "▼"} ${Math.abs(mnavChange).toFixed(3)} from prev`}
        gradient={
          isPositiveTrend
            ? "bg-gradient-to-br from-emerald-950/60 to-gray-900"
            : "bg-gradient-to-br from-red-950/60 to-gray-900"
        }
        valueColor={isPositiveTrend ? "text-emerald-400" : "text-red-400"}
      />
      <StatCard
        label="BTC Price"
        value={`$${latest.btcPrice.toLocaleString()}`}
        sub="Bitcoin / USD"
        gradient="bg-gradient-to-br from-amber-950/40 to-gray-900"
        valueColor="text-amber-400"
      />
      <StatCard
        label="MSTR Price"
        value={`$${latest.mstrPrice.toLocaleString()}`}
        sub="Strategy Inc."
        gradient="bg-gradient-to-br from-indigo-950/40 to-gray-900"
        valueColor="text-indigo-400"
      />
      <StatCard
        label="BTC Holdings"
        value={latest.btcHoldings.toLocaleString()}
        sub={`≈ $${(latest.btcHoldings * latest.btcPrice / 1e9).toFixed(1)}B value`}
        gradient="bg-gradient-to-br from-orange-950/40 to-gray-900"
        valueColor="text-orange-400"
      />
      <StatCard
        label="NAV Premium"
        value={`${Number(premiumPct) >= 0 ? "+" : ""}${premiumPct}%`}
        sub={`Market Cap: $${(latest.mstrMarketCap / 1e9).toFixed(1)}B`}
        gradient="bg-gradient-to-br from-purple-950/40 to-gray-900"
        valueColor={Number(premiumPct) >= 0 ? "text-purple-400" : "text-red-400"}
      />
    </div>
  );
}
