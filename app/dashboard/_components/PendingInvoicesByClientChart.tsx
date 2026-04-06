"use client";

import { useEffect, useState } from "react";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { useConvex } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { api } from "@/convex/_generated/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { filterInvoicesByDateRange, DateRange } from "@/lib/dateUtils";

interface PendingData {
  clientName: string;
  pendingInvoices: number;
}

interface PendingInvoicesByClientChartProps {
  dateRange: DateRange;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
];

export function PendingInvoicesByClientChart({ dateRange }: PendingInvoicesByClientChartProps) {
  const { invoices } = useInvoiceContext();
  const [pendingData, setPendingData] = useState<PendingData[]>([]);
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
      // Filter invoices by date range
      const filteredInvoices = filterInvoicesByDateRange(invoices || [], dateRange);
      const clientPendingCounts: { [key: string]: number } = {};

      // Count pending invoices per client
      filteredInvoices?.forEach((invoice: any) => {
        // Only count pending invoices (invoiceStatus === false)
        if (invoice?.invoiceStatus === false) {
          const clientId = invoice?.clientId;
          const client = allClients.find((c: any) => c._id === clientId);
          if (client) {
            clientPendingCounts[client.clientName] =
              (clientPendingCounts[client.clientName] || 0) + 1;
          }
        }
      });

      // Convert to array and sort
      const sortedChartData: PendingData[] = Object.entries(clientPendingCounts)
        .map(([clientName, pendingInvoices]) => ({
          clientName,
          pendingInvoices,
        }))
        .sort((a, b) => b.pendingInvoices - a.pendingInvoices);

      // Limit to top 10 clients and group rest as "Others"
      const top10 = sortedChartData.slice(0, 10);
      const remaining = sortedChartData.slice(10);

      let finalData = [...top10];

      // If there are more than 10 clients, add "Others"
      if (remaining.length > 0) {
        const othersTotal = remaining.reduce((sum, item) => sum + item.pendingInvoices, 0);
        finalData.push({
          clientName: `Others (${remaining.length} clients)`,
          pendingInvoices: othersTotal,
        });
      }

      setPendingData(finalData);
    }
  }, [invoices, allClients, dateRange]);

  if (pendingData.length === 0) {
    return (
      <Card className="w-full border-0 shadow-md">
        <CardHeader>
          <CardTitle>Pending Invoices by Client</CardTitle>
          <CardDescription>No pending invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            All invoices have been paid! 🎉
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-md">
      <CardHeader>
        <CardTitle>Pending Invoices by Client</CardTitle>
        <CardDescription>Number of unpaid invoices per client (Top 10 + Others)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pendingData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ clientName, pendingInvoices }) =>
                `${clientName}: ${pendingInvoices}`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="pendingInvoices"
            >
              {pendingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
