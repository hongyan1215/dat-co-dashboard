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

export default function MnavChart({ data }: Props) {
  const [logScale, setLogScale] = useState(false);
  const labels = data.map((d) => d.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: "mNAV",
        data: data.map((d) => d.mNAV),
        borderColor: "#34d399",
        backgroundColor: (ctx: { chart: ChartJS }) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(52,211,153,0.1)";
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(52,211,153,0.3)");
          gradient.addColorStop(1, "rgba(52,211,153,0.02)");
          return gradient;
        },
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2.5,
        yAxisID: "y",
      },
      {
        label: "BTC Price (USD)",
        data: data.map((d) => d.btcPrice),
        borderColor: "#f59e0b",
        backgroundColor: "transparent",
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 1.5,
        borderDash: [5, 5],
        yAxisID: "y1",
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
          afterTitle(items) {
            const idx = items[0]?.dataIndex;
            if (idx == null) return "";
            const d = data[idx];
            return `MSTR: $${d.mstrPrice.toLocaleString()} · MCap: $${(d.mstrMarketCap / 1e9).toFixed(1)}B`;
          },
          label(ctx) {
            const y = ctx.parsed?.y ?? 0;
            if (ctx.datasetIndex === 0) return ` mNAV: ${y.toFixed(3)}x  (${((y - 1) * 100).toFixed(1)}% premium)`;
            return ` BTC: $${y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", maxTicksLimit: 10, font: { size: 11 } },
        grid: { color: "rgba(75,85,99,0.15)" },
      },
      y: {
        type: logScale ? "logarithmic" : "linear",
        position: "left",
        beginAtZero: false,
        ticks: { color: "#34d399", callback: (v) => `${parseFloat(Number(v).toFixed(2))}x` },
        grid: { color: "rgba(75,85,99,0.15)" },
      },
      y1: {
        type: logScale ? "logarithmic" : "linear",
        position: "right",
        beginAtZero: false,
        ticks: {
          color: "#f59e0b",
          callback: (v) => `$${(Number(v) / 1000).toFixed(0)}k`,
        },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-200">
            mNAV Ratio & BTC Price
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            NAV multiple over time with BTC price overlay
          </p>
        </div>
        <button
          onClick={() => setLogScale(!logScale)}
          className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        >
          {logScale ? "Linear" : "Log"} Scale
        </button>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" />
          Above 1.0x = Premium
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />
          Below 1.0x = Discount
        </span>
      </div>
    </div>
  );
}
