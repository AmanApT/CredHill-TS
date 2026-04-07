"use client";

import { useEffect, useState } from "react";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { useConvex } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { api } from "@/convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { filterInvoicesByDateRange, DateRange } from "@/lib/dateUtils";

interface ClientData {
  clientName: string;
  invoiceCount: number;
}

interface ClientWiseInvoicesChartProps {
  dateRange: DateRange;
}

export function ClientWiseInvoicesChart({ dateRange }: ClientWiseInvoicesChartProps) {
  const { invoices } = useInvoiceContext();
  const [clientData, setClientData] = useState<ClientData[]>([]);
  const [allClients, setAllClients] = useState<{ _id: string; clientName: string }[]>([]);
  const convex = useConvex();
  const { user } = useKindeBrowserClient();

  useEffect(() => {
    const fetchClients = async () => {
      if (user?.email) {
        const clients = await convex.query(api.functions.clients.getClients, {
          email: user?.email || "",
        });
        setAllClients(clients as unknown as { _id: string; clientName: string }[]);
      }
    };

    fetchClients();
  }, [convex, user?.email]);

  useEffect(() => {
    if (invoices && allClients.length > 0) {
      // Filter invoices by date range
      const filteredInvoices = filterInvoicesByDateRange(invoices || [], dateRange);
      const clientInvoiceCounts: { [key: string]: number } = {};

      // Count invoices per client
      filteredInvoices?.forEach((invoice: any) => {
        const clientId = invoice?.clientId;
        const client = allClients.find((c: any) => c._id === clientId);
        if (client) {
          clientInvoiceCounts[client.clientName] =
            (clientInvoiceCounts[client.clientName] || 0) + 1;
        }
      });

      // Convert to array and sort
      const chartData: ClientData[] = Object.entries(clientInvoiceCounts)
        .map(([clientName, invoiceCount]) => ({
          clientName,
          invoiceCount,
        }))
        .sort((a, b) => b.invoiceCount - a.invoiceCount);

      setClientData(chartData);
    }
  }, [invoices, allClients, dateRange]);

  if (clientData.length === 0) {
    return (
      <Card className="w-full border-0 shadow-md">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm font-semibold">Client-Wise Invoices</CardTitle>
          <CardDescription className="text-xs">No invoice data available</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            Create invoices to see client-wise breakdown
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-md">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold">Client-Wise Invoices</CardTitle>
        <CardDescription className="text-xs">Number of invoices per client</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={clientData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="clientName" tick={false} axisLine={false} height={8} />
            <YAxis tick={{ fontSize: 11 }} width={30} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="invoiceCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
