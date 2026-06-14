import type { TableRow } from "@/contexts/InvoiceContexts";

/** Sum line-item amounts/taxes — identical reducer used across all doc types. */
export function calculateTotalSums(rows: TableRow[]) {
  return (rows ?? []).reduce(
    (sums, row) => {
      sums.amount += row.amount;
      sums.cgst += row.cgst;
      sums.sgst += row.sgst;
      sums.igst += row.igst;
      sums.total += row.total;
      return sums;
    },
    { amount: 0, cgst: 0, sgst: 0, total: 0, igst: 0 }
  );
}
