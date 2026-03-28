"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import type { DailyData } from "@/lib/data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  data: DailyData[];
}

export default function MarketCapChart({ data }: Props) {
  const [logScale, setLogScale] = useState(false);
  const labels = data.map((d) => d.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: "MSTR Market Cap",
        data: data.map((d) => d.mstrMarketCap / 1e9),
        borderColor: "#818cf8",
        backgroundColor: (ctx: { chart: ChartJS }) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(129,140,248,0.1)";
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(129,140,248,0.25)");
          gradient.addColorStop(1, "rgba(129,140,248,0.02)");
          return gradient;
        },
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2,
      },
      {
        label: "BTC Holdings Value",
        data: data.map((d) => (d.btcHoldings * d.btcPrice) / 1e9),
        borderColor: "#f59e0b",
        backgroundColor: (ctx: { chart: ChartJS }) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(245,158,11,0.1)";
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(245,158,11,0.2)");
          gradient.addColorStop(1, "rgba(245,158,11,0.02)");
          return gradient;
        },
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: {
        labels: { color: "#9ca3af", usePointStyle: true, pointStyleWidth: 10 },
      },
      tooltip: {
        backgroundColor: "rgba(17,24,39,0.95)",
        titleColor: "#f3f4f6",
        bodyColor: "#d1d5db",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label(ctx) {
            return ` ${ctx.dataset.label}: $${(ctx.parsed?.y ?? 0).toFixed(1)}B`;
          },
          afterBody(items) {
            const idx = items[0]?.dataIndex;
            if (idx == null) return "";
            const d = data[idx];
            const gap = d.mstrMarketCap / 1e9 - (d.btcHoldings * d.btcPrice) / 1e9;
            return `\n Premium Gap: $${gap.toFixed(1)}B`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", maxTicksLimit: 8, font: { size: 11 } },
        grid: { color: "rgba(75,85,99,0.15)" },
      },
      y: {
        type: logScale ? "logarithmic" : "linear",
        beginAtZero: false,
        ticks: {
          color: "#9ca3af",
          callback: (v) => `$${Number(v).toFixed(0)}B`,
        },
        grid: { color: "rgba(75,85,99,0.15)" },
      },
    },
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-200">
            Market Cap vs BTC Value
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Gap shows NAV premium</p>
        </div>
        <button
          onClick={() => setLogScale(!logScale)}
          className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        >
          {logScale ? "Linear" : "Log"}
        </button>
      </div>
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
