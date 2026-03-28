"use client";

import { useState, useMemo } from "react";
import type { DailyData } from "@/lib/data";

type SortKey = "date" | "mNAV" | "mstrPrice" | "btcPrice" | "mstrMarketCap" | "btcHoldings" | "premium";

interface Props {
  data: DailyData[];
}

export default function DataTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === "date") {
        va = new Date(a.date).getTime();
        vb = new Date(b.date).getTime();
      } else if (sortKey === "premium") {
        va = (a.mNAV - 1) * 100;
        vb = (b.mNAV - 1) * 100;
      } else {
        va = a[sortKey];
        vb = b[sortKey];
      }
      return sortAsc ? va - vb : vb - va;
    });
    return arr;
  }, [data, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
      onClick={() => handleSort(k)}
    >
      {label}{" "}
      {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 border-b border-gray-800 z-10">
            <tr>
              <SortHeader k="date" label="Date" />
              <SortHeader k="mNAV" label="mNAV" />
              <SortHeader k="mstrPrice" label="MSTR Price" />
              <SortHeader k="btcPrice" label="BTC Price" />
              <SortHeader k="mstrMarketCap" label="Market Cap" />
              <SortHeader k="btcHoldings" label="BTC Holdings" />
              <SortHeader k="premium" label="NAV Premium" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => {
              const premium = ((d.mNAV - 1) * 100).toFixed(1);
              return (
                <tr
                  key={d.date}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                    i % 2 === 0 ? "bg-gray-900/30" : "bg-gray-950/30"
                  }`}
                >
                  <td className="px-4 py-2.5 text-gray-300 font-mono text-xs">
                    {d.date}
                  </td>
                  <td
                    className={`px-4 py-2.5 font-semibold ${
                      d.mNAV >= 1 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {d.mNAV.toFixed(2)}x
                  </td>
                  <td className="px-4 py-2.5 text-indigo-400">
                    ${d.mstrPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-amber-400">
                    ${d.btcPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-gray-300">
                    ${(d.mstrMarketCap / 1e9).toFixed(1)}B
                  </td>
                  <td className="px-4 py-2.5 text-orange-400">
                    {d.btcHoldings.toLocaleString()}
                  </td>
                  <td
                    className={`px-4 py-2.5 font-medium ${
                      Number(premium) >= 0 ? "text-purple-400" : "text-red-400"
                    }`}
                  >
                    {Number(premium) >= 0 ? "+" : ""}{premium}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
