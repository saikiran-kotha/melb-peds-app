import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const MOCK_DATA = [
  { timestamp: "09:00", error: 5 },
  { timestamp: "10:00", error: 3 },
  { timestamp: "11:00", error: 7 },
  { timestamp: "12:00", error: 2 },
  { timestamp: "13:00", error: 6 },
];

export default function Dashboard() {
  const [data] = useState(MOCK_DATA);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Model Error Over Time
        </h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
          Refresh
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg h-[60vh]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip labelFormatter={(l) => `Time: ${l}`} />
            <Line
              type="monotone"
              dataKey="error"
              stroke="#3B82F6"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
