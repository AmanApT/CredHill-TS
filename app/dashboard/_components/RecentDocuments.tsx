"use client";

import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import moment from "moment";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { filterInvoicesByDateRange, filterInvoicesByClients, DateRange } from "@/lib/dateUtils";
import { formatIndianNumber } from "@/lib/invoiceUtils";
import { DOC_META } from "@/lib/documentConfig";
import { getDocStatusInfo } from "@/lib/statusBadge";

type NewDocType = "quotation" | "proforma";

export function RecentDocuments({
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
  const noField = meta.numberField;

  const filtered = filterInvoicesByClients(
    filterInvoicesByDateRange(source || [], dateRange),
    selectedClientIds
  );
  const recent = filtered
    ?.slice()
    .sort((a: any, b: any) => b._creationTime - a._creationTime)
    .slice(0, 5) || [];

  return (
    <Card className="w-full border-0 shadow-md">
      <CardHeader>
        <CardTitle>Recent {meta.docLabel}s</CardTitle>
        <CardDescription>Your 5 most recent {meta.docLabel.toLowerCase()}s</CardDescription>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-gray-500">
            No {meta.docLabel.toLowerCase()}s yet
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((doc: any) => {
              const info = getDocStatusInfo(docType, doc.status);
              return (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{doc[noField]}</p>
                    <p className="text-sm text-gray-600">{moment(doc.date).format("DD MMM YYYY")}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-semibold text-gray-900">₹{formatIndianNumber(doc.totalAmount)}</p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.bgClass} ${info.textClass}`}
                    >
                      {info.label}
                    </span>
                  </div>
                  <Link href={meta.routes.edit(doc._id)}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
