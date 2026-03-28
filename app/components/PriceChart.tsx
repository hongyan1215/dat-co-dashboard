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
  Legend
);

interface Props {
  data: DailyData[];
}

export default function PriceChart({ data }: Props) {
  const [logScale, setLogScale] = useState(false);
  const labels = data.map((d) => d.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: "MSTR Price",
        data: data.map((d) => d.mstrPrice),
        borderColor: "#818cf8",
        backgroundColor: "transparent",
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2,
        yAxisID: "y",
      },
      {
        label: "BTC Price",
        data: data.map((d) => d.btcPrice),
        borderColor: "#f59e0b",
        backgroundColor: "transparent",
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2,
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
          label(ctx) {
            return ` ${ctx.dataset.label}: $${(ctx.parsed?.y ?? 0).toLocaleString()}`;
          },
          afterBody(items) {
            const idx = items[0]?.dataIndex;
            if (idx == null) return "";
            const d = data[idx];
            return `\n mNAV: ${d.mNAV.toFixed(2)}x · Holdings: ${d.btcHoldings.toLocaleString()} BTC`;
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
        position: "left",
        beginAtZero: false,
        ticks: {
          color: "#818cf8",
          callback: (v) => `$${Number(v).toLocaleString()}`,
        },
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
            MSTR vs BTC Price
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Dual-axis price comparison</p>
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
