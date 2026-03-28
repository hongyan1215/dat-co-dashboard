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
  Legend
);

interface Props {
  data: DailyData[];
}

export default function PriceChart({ data }: Props) {
  const labels = data.map((d) => d.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: "MSTR Stock Price (USD)",
        data: data.map((d) => d.mstrPrice),
        borderColor: "#818cf8",
        backgroundColor: "rgba(129, 140, 248, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHitRadius: 10,
        borderWidth: 2,
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
            return `${ctx.dataset.label}: $${(ctx.parsed?.y ?? 0).toLocaleString()}`;
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
          color: "#818cf8",
          callback: (v) => `$${Number(v).toLocaleString()}`,
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
        MSTR & BTC Price Comparison
      </h2>
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
