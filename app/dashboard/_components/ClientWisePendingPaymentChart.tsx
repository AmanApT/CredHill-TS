"use client";

import { useEffect, useState } from "react";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { useConvex } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { api } from "@/convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { filterInvoicesByDateRange, DateRange } from "@/lib/dateUtils";
import { formatIndianNumber } from "@/lib/invoiceUtils";

interface ClientPendingData {
  clientName: string;
  pendingAmount: number;
}

interface ClientWisePendingPaymentChartProps {
  dateRange: DateRange;
}

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#f59e0b", "#d97706",
  "#dc2626", "#e11d48", "#be123c", "#c026d3", "#9333ea",
];

export function ClientWisePendingPaymentChart({ dateRange }: ClientWisePendingPaymentChartProps) {
  const { invoices } = useInvoiceContext();
  const [clientData, setClientData] = useState<ClientPendingData[]>([]);
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
      const filteredInvoices = filterInvoicesByDateRange(invoices || [], dateRange);
      const clientPending: { [key: string]: number } = {};

      // Only count unpaid invoices
      filteredInvoices?.forEach((invoice: any) => {
        if (invoice?.invoiceStatus === false) {
          const clientId = invoice?.clientId;
          const client = allClients.find((c: any) => c._id === clientId);
          if (client) {
            clientPending[client.clientName] =
              (clientPending[client.clientName] || 0) + parseFloat(invoice?.totalAmount || 0);
          }
        }
      });

      const chartData: ClientPendingData[] = Object.entries(clientPending)
        .map(([clientName, pendingAmount]) => ({ clientName, pendingAmount }))
        .sort((a, b) => b.pendingAmount - a.pendingAmount);

      setClientData(chartData);
    }
  }, [invoices, allClients, dateRange]);

  if (clientData.length === 0) {
    return (
      <Card className="w-full border-0 shadow-md">
        <CardHeader>
          <CardTitle>Client-Wise Pending Payment</CardTitle>
          <CardDescription>No pending payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            All payments have been received!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-md">
      <CardHeader>
        <CardTitle>Client-Wise Pending Payment</CardTitle>
        <CardDescription>Unpaid amount per client</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={clientData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="clientName"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`₹${formatIndianNumber(value)}`, "Pending"]}
            />
            <Bar dataKey="pendingAmount" radius={[8, 8, 0, 0]}>
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
