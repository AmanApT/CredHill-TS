"use client";

import { useEffect, useState } from "react";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { useConvex } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { api } from "@/convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { filterInvoicesByDateRange, filterInvoicesByClients, DateRange } from "@/lib/dateUtils";
import { formatIndianNumber } from "@/lib/invoiceUtils";

interface ClientRevenueData {
  clientName: string;
  revenue: number;
}

interface ClientWiseRevenueChartProps {
  dateRange: DateRange;
  selectedClientIds?: string[];
}

const COLORS = [
  "#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4",
  "#14b8a6", "#10b981", "#22c55e", "#84cc16", "#eab308",
];

export function ClientWiseRevenueChart({ dateRange, selectedClientIds = [] }: ClientWiseRevenueChartProps) {
  const { invoices } = useInvoiceContext();
  const [clientData, setClientData] = useState<ClientRevenueData[]>([]);
  const [allClients, setAllClients] = useState([]);
  const convex = useConvex();
  const { user } = useKindeBrowserClient();

  useEffect(() => {
    const fetchClients = async () => {
      if (user?.email) {
        const clients = await convex.query(api.functions.clients.getClients, {
          email: user?.email || "",
        });
        setAllClients(clients);
      }
    };
    fetchClients();
  }, [convex, user?.email]);

  useEffect(() => {
    if (invoices && allClients.length > 0) {
      const filteredInvoices = filterInvoicesByClients(
        filterInvoicesByDateRange(invoices || [], dateRange),
        selectedClientIds
      );
      const clientRevenue: { [key: string]: number } = {};

      filteredInvoices?.forEach((invoice: any) => {
        const clientId = invoice?.clientId;
        const client = allClients.find((c: any) => c._id === clientId);
        if (client) {
          clientRevenue[client.clientName] =
            (clientRevenue[client.clientName] || 0) + parseFloat(invoice?.totalAmount || 0);
        }
      });

      const chartData: ClientRevenueData[] = Object.entries(clientRevenue)
        .map(([clientName, revenue]) => ({ clientName, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

      setClientData(chartData);
    }
  }, [invoices, allClients, dateRange, selectedClientIds]);

  if (clientData.length === 0) {
    return (
      <Card className="w-full border-0 shadow-md">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm font-semibold">Client-Wise Revenue</CardTitle>
          <CardDescription className="text-xs">No revenue data available</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            Create invoices to see client-wise revenue
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-md">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold">Client-Wise Revenue</CardTitle>
        <CardDescription className="text-xs">Total revenue per client</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={clientData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="clientName" tick={false} axisLine={false} height={8} />
            <YAxis
              tick={{ fontSize: 11 }}
              width={40}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`₹${formatIndianNumber(value)}`, "Revenue"]}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {clientData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
