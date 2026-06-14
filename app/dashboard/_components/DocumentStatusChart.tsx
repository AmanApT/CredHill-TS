"use client";

import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { filterInvoicesByDateRange, filterInvoicesByClients, DateRange } from "@/lib/dateUtils";
import { DOC_META, StatusColor } from "@/lib/documentConfig";

type NewDocType = "quotation" | "proforma";

const STATUS_HEX: Record<StatusColor, string> = {
  gray: "#9ca3af",
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
  purple: "#8b5cf6",
};

export function DocumentStatusChart({
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

  const data = meta.statuses.map((s) => ({
    name: s.label,
    count: filtered.filter((d: any) => d.status === s.value).length,
    color: STATUS_HEX[s.color],
  }));

  const countOf = (st: string) => filtered.filter((d: any) => d.status === st).length;
  const rate =
    docType === "quotation"
      ? (() => {
          const decided = countOf("accepted") + countOf("rejected") + countOf("expired") + countOf("converted");
          const won = countOf("accepted") + countOf("converted");
          return decided > 0 ? Math.round((won / decided) * 100) : 0;
        })()
      : (() => {
          return filtered.length > 0 ? Math.round((countOf("converted") / filtered.length) * 100) : 0;
        })();

  const rateLabel = docType === "quotation" ? "Acceptance rate" : "Conversion rate";

  return (
    <Card className="w-full border-0 shadow-md">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold">{meta.docLabel} Status</CardTitle>
        <CardDescription className="text-xs">
          {rateLabel}: <span className="font-semibold text-gray-700">{rate}%</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        {filtered.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            No {meta.docLabel.toLowerCase()} data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((d, index) => (
                  <Cell key={`cell-${index}`} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
