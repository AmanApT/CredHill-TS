"use client";

import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, DollarSign, RefreshCw, XCircle } from "lucide-react";
import { filterInvoicesByDateRange, filterInvoicesByClients, DateRange } from "@/lib/dateUtils";
import { formatIndianNumber } from "@/lib/invoiceUtils";
import { DOC_META } from "@/lib/documentConfig";

type NewDocType = "quotation" | "proforma";

export function DocumentSummaryCards({
  docType,
  dateRange,
  selectedClientIds = [],
}: {
  docType: NewDocType;
  dateRange: DateRange;
  selectedClientIds?: string[];
}) {
  const { quotations, proformas } = useInvoiceContext();
  const meta = DOC_META[docType];
  const source = docType === "quotation" ? quotations : proformas;

  const filtered = filterInvoicesByClients(
    filterInvoicesByDateRange(source || [], dateRange),
    selectedClientIds
  );

  const total = filtered.length;
  const value = filtered.reduce((s, d: any) => s + parseFloat(d?.totalAmount || 0), 0);
  const countOf = (st: string) => filtered.filter((d: any) => d.status === st).length;

  const metrics =
    docType === "quotation"
      ? [
          { title: "Total Quotations", value: total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Accepted", value: countOf("accepted"), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { title: "Pending", value: countOf("draft") + countOf("sent"), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Converted", value: countOf("converted"), icon: RefreshCw, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Total Quoted Value", value: `₹${formatIndianNumber(value)}`, icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
        ]
      : [
          { title: "Total Proformas", value: total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Pending", value: countOf("draft") + countOf("sent") + countOf("accepted"), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Converted", value: countOf("converted"), icon: RefreshCw, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Cancelled", value: countOf("cancelled"), icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          { title: "Total Value", value: `₹${formatIndianNumber(value)}`, icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
        ];

  return (
    <div>
      <h2 className="section-heading text-gray-900 mb-2">{meta.docLabel} Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="border-0 shadow-md">
              <CardHeader className={`py-2 ${metric.bg}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700">{metric.title}</CardTitle>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className={`text-xl font-bold ${metric.color}`}>{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
