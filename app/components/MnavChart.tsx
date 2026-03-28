"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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
  const labels = data.map((d) => d.date);
  const mnavValues = data.map((d) => d.mNAV);
  const btcValues = data.map((d) => d.btcPrice);

  const chartData = {
    labels,
    datasets: [
      {
        label: "mNAV",
        data: mnavValues,
        borderColor: "#34d399",
        backgroundColor: "rgba(52, 211, 153, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2,
        yAxisID: "y",
      },
      {
        label: "BTC Price (USD)",
        data: btcValues,
        borderColor: "#f59e0b",
        backgroundColor: "transparent",
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 1.5,
        borderDash: [4, 4],
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
        backgroundColor: "#1f2937",
        titleColor: "#f3f4f6",
        bodyColor: "#d1d5db",
        borderColor: "#374151",
        borderWidth: 1,
        callbacks: {
          label(ctx) {
            const y = ctx.parsed?.y ?? 0;
            if (ctx.datasetIndex === 0) return `mNAV: ${y.toFixed(2)}x`;
            return `BTC: $${y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", maxTicksLimit: 8 },
        grid: { color: "rgba(75,85,99,0.2)" },
      },
      y: {
        position: "left",
        ticks: {
          color: "#34d399",
          callback: (v) => `${v}x`,
        },
        grid: { color: "rgba(75,85,99,0.2)" },
      },
      y1: {
        position: "right",
        ticks: {
          color: "#f59e0b",
          callback: (v) => `$${(Number(v) / 1000).toFixed(0)}k`,
        },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <h2 className="text-sm font-medium text-gray-300 mb-4">
        mNAV Ratio & BTC Price
      </h2>
      <div className="h-72">
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
