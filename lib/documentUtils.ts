/**
 * Prefix-aware document numbering, shared by quotations and proforma invoices.
 * Mirrors lib/invoiceUtils.ts but supports an optional prefix segment
 * (e.g. "QUO/2025-26/042"). The invoice helpers there are left untouched.
 */
import { getIndianFY } from "./invoiceUtils";

export { getIndianFY };

/** "QUO", "2025-26", 42 -> "QUO/2025-26/042". Empty prefix -> "2025-26/042". */
export function formatDocNo(prefix: string, fy: string, num: number): string {
  const padded = String(num).padStart(3, "0");
  return prefix ? `${prefix}/${fy}/${padded}` : `${fy}/${padded}`;
}

/** Parse the numeric portion — the LAST "/"-segment (handles prefixed, plain and legacy). */
export function parseDocNo(stored: string): number {
  if (!stored) return 0;
  const parts = stored.split("/");
  return parseInt(parts[parts.length - 1], 10) || 0;
}

/** Financial-year segment regardless of prefix (the second-to-last segment). */
export function parseDocFY(stored: string): string | null {
  if (!stored) return null;
  const parts = stored.split("/");
  return parts.length >= 2 ? parts[parts.length - 2] : null;
}

/** Split a stored number for edit-mode display: { prefix, fy, numericStr }. */
export function splitStoredDocNo(
  stored: string,
  prefix: string
): { prefix: string; fy: string; numericStr: string } {
  const parts = (stored ?? "").split("/");
  if (parts.length >= 3) return { prefix: parts[0], fy: parts[1], numericStr: parts[2] };
  if (parts.length === 2) return { prefix: "", fy: parts[0], numericStr: parts[1] };
  const num = parseInt(stored, 10) || 0;
  return { prefix, fy: getIndianFY(), numericStr: String(num).padStart(3, "0") };
}

/**
 * Suggest the next document number from existing docs of this type, resetting to
 * 1 on a financial-year change. Best-effort client-side prefill — the server's
 * uniqueness check is the real guard.
 */
export function nextDocNumber(
  docs: any[],
  noField: string,
  prefix: string
): { numericStr: string; fullNo: string } {
  const fy = getIndianFY();
  let max = 0;
  for (const d of docs ?? []) {
    const stored = d?.[noField] as string | undefined;
    if (stored && parseDocFY(stored) === fy) max = Math.max(max, parseDocNo(stored));
  }
  const next = max + 1;
  return {
    numericStr: String(next).padStart(3, "0"),
    fullNo: formatDocNo(prefix, fy, next),
  };
}
