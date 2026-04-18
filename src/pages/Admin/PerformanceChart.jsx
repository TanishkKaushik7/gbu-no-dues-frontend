import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "../../contexts/AuthContext";

// --- SHADCN CHART IMPORTS ---
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const DEPT_MAP = {
  "Corporate Relations Cell": "CRC",
  "University Library": "LIB",
  "Sports Department": "SPO",
  "Finance & Accounts": "ACC",
  Laboratories: "LAB",
  "Hostel Administration": "HST",
  "School Dean": "DEAN",
  "Computer Science & Engineering": "CSE",
  "Information Technology": "IT",
  Staff: "STAFF",
};

// --- SHADCN CHART CONFIG ---
const chartConfig = {
  cleared: {
    label: "Cleared",
    color: "#2563eb", // blue-600
  },
  pending: {
    label: "Pending",
    color: "#bfdbfe", // blue-200
  },
};

const PerformanceChart = () => {
  const { authFetch } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        const response = await authFetch("/api/admin/analytics/performance");
        if (response.ok) {
          const rawData = await response.json();
          const chartData = rawData
            .filter((dept) => dept.approved_count + dept.pending_count > 0)
            .map((dept) => ({
              name: dept.dept_name || "Unknown",
              cleared: dept.approved_count,
              pending: dept.pending_count,
            }));
          setData(chartData);
        }
      } catch (err) {
        console.error("Chart Error:");
      } finally {
        setLoading(false);
      }
    };
    fetchPerformanceData();
  }, [authFetch]);

  if (loading)
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4 p-8">
        <div className="w-full h-48 bg-slate-50 rounded-3xl animate-pulse" />
        <div className="w-1/3 h-3 bg-slate-50 rounded-full animate-pulse" />
      </div>
    );

  // ✅ DYNAMIC WIDTH CALCULATION
  // Keep enough horizontal room for long department labels.
  const minChartWidth = Math.max(data.length * 130, 700);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Scrollable Container */}
      <div className="flex-1 w-full overflow-x-auto custom-scrollbar scroll-smooth pb-4">
        <div
          style={{ width: minChartWidth, height: "100%", minHeight: "380px" }}
        >
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: -20, bottom: 24 }}
              barGap={8} // Gives nice breathing room between the two bars
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 800 }}
                interval={0}
                angle={-28}
                textAnchor="end"
                tickMargin={14}
                height={84}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#cbd5e1", fontSize: 10, fontWeight: 700 }}
                allowDecimals={false}
                dx={-5}
              />

              {/* Shadcn Tooltip */}
              <ChartTooltip
                cursor={{ fill: "#f8fafc", radius: 8 }}
                content={<ChartTooltipContent indicator="dot" />}
              />

              {/* Shadcn Legend */}
              <ChartLegend
                content={<ChartLegendContent />}
                verticalAlign="top"
                align="right"
                className="pb-6"
              />

              {/* The Bars */}
              <Bar
                dataKey="cleared"
                fill="var(--color-cleared)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32} // Replaces hardcoded barSize so it flexes beautifully
                animationDuration={1500}
              />
              <Bar
                dataKey="pending"
                fill="var(--color-pending)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                animationDuration={1500}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
