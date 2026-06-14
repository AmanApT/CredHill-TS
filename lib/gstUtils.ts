/**
 * Shared GST logic, extracted from the (unchanged) invoice components where it
 * was duplicated inline. Indian GST: intra-state -> CGST+SGST (rate/2 each),
 * inter-state -> IGST (full rate). State is the first 2 chars of the GSTIN.
 */
export type GstMode = "intra" | "inter";

export function getGstMode(sellerGstin?: string, buyerGstin?: string): GstMode {
  const seller = sellerGstin?.substring(0, 2);
  const buyer = buyerGstin?.substring(0, 2);
  return !!(seller && buyer && seller === buyer) ? "intra" : "inter";
}

export function computeRowTax(
  amount: number,
  gstRate: number,
  mode: GstMode
): { cgst: number; sgst: number; igst: number; total: number } {
  const isLocal = mode === "intra";
  return {
    cgst: isLocal ? (amount * gstRate) / 200 : 0,
    sgst: isLocal ? (amount * gstRate) / 200 : 0,
    igst: isLocal ? 0 : (amount * gstRate) / 100,
    total: amount + (amount * gstRate) / 100,
  };
}

/** Whether a GST column should render for the current mode (cgst/sgst vs igst). */
export function isGstColumnVisibleForMode(colKey: string, mode: GstMode): boolean {
  if (colKey === "cgst" || colKey === "sgst") return mode === "intra";
  if (colKey === "igst") return mode === "inter";
  return true;
}
