"use client";

import { useEffect, useState } from "react";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { filterInvoicesByDateRange, DateRange } from "@/lib/dateUtils";
import { formatIndianNumber } from "@/lib/invoiceUtils";
import moment from "moment";

type TimeGrouping = "daily" | "weekly" | "monthly";
type MetricType = "revenue" | "invoiceCount" | "both";

interface TimelineDataPoint {
  label: string;
  revenue: number;
  invoiceCount: number;
}

interface RevenueTimelineChartProps {
  dateRange: DateRange;
}

export function RevenueTimelineChart({ dateRange }: RevenueTimelineChartProps) {
  const { invoices } = useInvoiceContext();
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>("monthly");
  const [metric, setMetric] = useState<MetricType>("both");
  const [chartData, setChartData] = useState<TimelineDataPoint[]>([]);

  useEffect(() => {
    if (!invoices) return;

    const filteredInvoices = filterInvoicesByDateRange(invoices || [], dateRange);
    const grouped: { [key: string]: { revenue: number; invoiceCount: number } } = {};

    // Generate all time buckets in range so we get zero-value entries too
    const start = moment(dateRange.startDate);
    const end = moment(dateRange.endDate);

    if (timeGrouping === "daily") {
      const cursor = start.clone();
      while (cursor.isSameOrBefore(end, "day")) {
        const key = cursor.format("DD MMM");
        grouped[key] = { revenue: 0, invoiceCount: 0 };
        cursor.add(1, "day");
      }
    } else if (timeGrouping === "weekly") {
      const cursor = start.clone().startOf("isoWeek");
      while (cursor.isSameOrBefore(end, "week")) {
        const weekEnd = cursor.clone().endOf("isoWeek");
        const key = `${cursor.format("DD MMM")} - ${weekEnd.format("DD MMM")}`;
        grouped[key] = { revenue: 0, invoiceCount: 0 };
        cursor.add(1, "week");
      }
    } else {
      const cursor = start.clone().startOf("month");
      while (cursor.isSameOrBefore(end, "month")) {
        const key = cursor.format("MMM YYYY");
        grouped[key] = { revenue: 0, invoiceCount: 0 };
        cursor.add(1, "month");
      }
    }

    // Fill in actual data
    filteredInvoices?.forEach((invoice: any) => {
      const invoiceDate = moment(invoice?.date);
      let key = "";

      if (timeGrouping === "daily") {
        key = invoiceDate.format("DD MMM");
      } else if (timeGrouping === "weekly") {
        const weekStart = invoiceDate.clone().startOf("isoWeek");
        const weekEnd = invoiceDate.clone().endOf("isoWeek");
        key = `${weekStart.format("DD MMM")} - ${weekEnd.format("DD MMM")}`;
      } else {
        key = invoiceDate.format("MMM YYYY");
      }

      if (grouped[key]) {
        grouped[key].revenue += parseFloat(invoice?.totalAmount || 0);
        grouped[key].invoiceCount += 1;
      }
    });

    const data: TimelineDataPoint[] = Object.entries(grouped).map(
      ([label, values]) => ({
        label,
        revenue: parseFloat(values.revenue.toFixed(2)),
        invoiceCount: values.invoiceCount,
      })
    );

    setChartData(data);
  }, [invoices, dateRange, timeGrouping]);

  const showRevenue = metric === "revenue" || metric === "both";
  const showCount = metric === "invoiceCount" || metric === "both";

  return (
    <Card className="w-full border-0 shadow-md">
      <CardHeader className="px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">Revenue & Invoices Timeline</CardTitle>
            <CardDescription className="text-xs">Track revenue and invoice volume over time</CardDescription>
          </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          {/* X-Axis: Time Grouping */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">X-Axis:</span>
            <div className="flex gap-1">
              {(["daily", "weekly", "monthly"] as TimeGrouping[]).map((g) => (
                <Button
                  key={g}
                  size="sm"
                  variant={timeGrouping === g ? "default" : "outline"}
                  className={`text-xs h-7 px-2.5 ${timeGrouping === g ? "bg-indigo-600" : ""}`}
                  onClick={() => setTimeGrouping(g)}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Y-Axis: Metric */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Y-Axis:</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={metric === "both" ? "default" : "outline"}
                className={`text-xs h-7 px-2.5 ${metric === "both" ? "bg-indigo-600" : ""}`}
                onClick={() => setMetric("both")}
              >
                Both
              </Button>
              <Button
                size="sm"
                variant={metric === "revenue" ? "default" : "outline"}
                className={`text-xs h-7 px-2.5 ${metric === "revenue" ? "bg-purple-600" : ""}`}
                onClick={() => setMetric("revenue")}
              >
                Revenue
              </Button>
              <Button
                size="sm"
                variant={metric === "invoiceCount" ? "default" : "outline"}
                className={`text-xs h-7 px-2.5 ${metric === "invoiceCount" ? "bg-blue-600" : ""}`}
                onClick={() => setMetric("invoiceCount")}
              >
                Invoices
              </Button>
            </div>
          </div>
        </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-3">
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            No data available for the selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                angle={timeGrouping === "weekly" ? -30 : 0}
                textAnchor={timeGrouping === "weekly" ? "end" : "middle"}
                height={timeGrouping === "weekly" ? 80 : 40}
              />

              {/* Revenue Y-Axis (Left) */}
              {showRevenue && (
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) =>
                    value >= 100000
                      ? `${(value / 100000).toFixed(1)}L`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(0)}k`
                      : `${value}`
                  }
                  label={{
                    value: "Revenue (₹)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "#8b5cf6" },
                  }}
                />
              )}

              {/* Invoice Count Y-Axis (Right) */}
              {showCount && (
                <YAxis
                  yAxisId="count"
                  orientation={showRevenue ? "right" : "left"}
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  label={{
                    value: "Invoices",
                    angle: showRevenue ? 90 : -90,
                    position: showRevenue ? "insideRight" : "insideLeft",
                    style: { fontSize: 11, fill: "#3b82f6" },
                  }}
                />
              )}

              <Tooltip
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "revenue") return [`₹${formatIndianNumber(value)}`, "Revenue"];
                  return [value, "Invoices"];
                }}
              />
              <Legend />

              {showRevenue && (
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
              )}
              {showCount && (
                <Area
                  yAxisId="count"
                  type="monotone"
                  dataKey="invoiceCount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  name="Invoices"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
