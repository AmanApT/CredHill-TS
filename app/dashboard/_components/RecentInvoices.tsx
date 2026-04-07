"use client";

import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import moment from "moment";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { filterInvoicesByDateRange, DateRange } from "@/lib/dateUtils";
import { formatIndianNumber } from "@/lib/invoiceUtils";

interface RecentInvoicesProps {
  dateRange: DateRange;
}

export function RecentInvoices({ dateRange }: RecentInvoicesProps) {
  const { invoices } = useInvoiceContext();

  // Filter by date range, then get last 5
  const filteredInvoices = filterInvoicesByDateRange(invoices || [], dateRange);
  const recentInvoices = filteredInvoices
    ?.slice()
    .sort((a: any, b: any) => b._creationTime - a._creationTime)
    .slice(0, 5) || [];

  return (
    <Card className="w-full border-0 shadow-md">
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>Your 5 most recent invoices</CardDescription>
      </CardHeader>
      <CardContent>
        {recentInvoices.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-gray-500">
            No invoices yet
          </div>
        ) : (
          <div className="space-y-3">
            {recentInvoices.map((invoice: any) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{invoice.invoiceNo}</p>
                  <p className="text-sm text-gray-600">
                    {moment(invoice.date).format("DD MMM YYYY")}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold text-gray-900">₹{formatIndianNumber(invoice.totalAmount)}</p>
                  <p
                    className={`text-xs font-medium ${
                      invoice.invoiceStatus
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {invoice.invoiceStatus ? "✓ Paid" : "⏳ Unpaid"}
                  </p>
                </div>
                <Link href={`/create_invoice/${invoice._id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
