import { DOC_META, DocType, StatusColor } from "./documentConfig";

const COLOR_CLASSES: Record<StatusColor, { bg: string; text: string }> = {
  gray: { bg: "bg-gray-100", text: "text-gray-700" },
  blue: { bg: "bg-blue-100", text: "text-blue-800" },
  green: { bg: "bg-green-100", text: "text-green-800" },
  red: { bg: "bg-red-100", text: "text-red-800" },
  amber: { bg: "bg-amber-100", text: "text-amber-800" },
  purple: { bg: "bg-purple-100", text: "text-purple-800" },
};

/** Enum-status badge info for quotations/proformas. */
export function getDocStatusInfo(type: DocType, status: string): {
  label: string;
  bgClass: string;
  textClass: string;
} {
  const opt = DOC_META[type].statuses.find((s) => s.value === status);
  const classes = COLOR_CLASSES[opt?.color ?? "gray"];
  return { label: opt?.label ?? status, bgClass: classes.bg, textClass: classes.text };
}

// Invoices keep the existing paid/pending boolean helper.
export { getPaymentStatusInfo } from "./invoiceUtils";
