"use client";

interface Props {
  days: number;
  onChange: (days: number) => void;
}

const options = [
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "180D", value: 180 },
  { label: "1Y", value: 365 },
  { label: "2Y", value: 730 },
];

export default function DateRangeSelector({ days, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            days === o.value
              ? "bg-gray-700 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
