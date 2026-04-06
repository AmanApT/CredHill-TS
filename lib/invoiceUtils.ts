/**
 * Utility functions for invoice number handling and Indian financial year calculations.
 * Supports both legacy (bare numeric) and new (FY-formatted) invoice numbers.
 */

/**
 * Returns the Indian Financial Year string for a given date.
 * Financial year runs from April 1 to March 31.
 * Example: March 31, 2025 → "2024-25", April 1, 2025 → "2025-26"
 */
export function getIndianFY(date: Date = new Date()): string {
  const month = date.getMonth(); // 0-indexed: Jan=0, Apr=3, Dec=11
  const year = date.getFullYear();

  if (month >= 3) {
    // April (3) through December (11): current year is the start year
    return `${year}-${String(year + 1).slice(2)}`;
  }
  // January (0) through March (2): previous year is the start year
  return `${year - 1}-${String(year).slice(2)}`;
}

/**
 * Parses the numeric portion from an invoice number.
 * Handles both:
 * - New format: "2025-26/042" → 42
 * - Legacy format: "42" → 42
 *
 * Used for auto-increment calculation and backward compatibility.
 */
export function parseInvoiceNo(stored: string): number {
  if (!stored) return 0;

  if (stored.includes("/")) {
    // New format: extract part after slash
    const numericPart = stored.split("/")[1];
    return parseInt(numericPart, 10) || 0;
  }

  // Legacy format: just parse the entire string
  return parseInt(stored, 10) || 0;
}

/**
 * Formats an invoice number with financial year prefix and zero-padding.
 * Example: "2025-26", 42 → "2025-26/042"
 */
export function formatInvoiceNo(fy: string, num: number): string {
  const paddedNum = String(num).padStart(3, "0");
  return `${fy}/${paddedNum}`;
}

/**
 * Splits a stored invoice number into financial year and numeric portions.
 * Used in edit mode to display the FY (read-only) and number parts separately.
 *
 * Handles both:
 * - New format: "2025-26/042" → { fy: "2025-26", numericStr: "042" }
 * - Legacy format: "42" → { fy: <current FY>, numericStr: "042" }
 */
export function splitStoredInvoiceNo(stored: string): {
  fy: string;
  numericStr: string;
} {
  if (stored?.includes("/")) {
    // New format: split on /
    const [fy, numericStr] = stored.split("/");
    return { fy, numericStr };
  }

  // Legacy format: no /, so compute FY and pad the number
  const num = parseInt(stored, 10) || 0;
  return {
    fy: getIndianFY(),
    numericStr: String(num).padStart(3, "0"),
  };
}

/**
 * Returns payment status text and styling information.
 * Used for badges in UI.
 * @param isPaid - boolean: true = Payment Received, false = Pending
 */
export function getPaymentStatusInfo(isPaid: boolean): {
  label: string;
  badge: "green" | "yellow";
  bgClass: string;
  textClass: string;
} {
  if (isPaid) {
    return {
      label: "Payment Received",
      badge: "green",
      bgClass: "bg-green-100",
      textClass: "text-green-800",
    };
  }
  return {
    label: "Pending",
    badge: "yellow",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-800",
  };
}
