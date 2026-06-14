/**
 * Single source of truth for the three sales-document types. Drives labels,
 * numbering prefix, status models, routes and available conversions so the
 * shared quotation/proforma components branch on data, not hardcoded strings.
 */

export type DocType = "invoice" | "quotation" | "proforma";

export type StatusColor = "gray" | "blue" | "green" | "red" | "amber" | "purple";

export interface StatusOption {
  value: string;
  label: string;
  color: StatusColor;
}

export interface DocTypeMeta {
  type: DocType;
  docLabel: string; // "Invoice" | "Quotation" | "Proforma Invoice"
  previewTitle: string; // shown on the printed document
  numberLabel: string; // "Quotation No."
  numberPrefix: string; // "" | "QUO" | "PI"
  numberField: string; // "invoiceNo" | "quotationNo" | "proformaNo"
  statusModel: "boolean" | "enum";
  defaultStatus?: string;
  statuses: StatusOption[];
  showValidity: boolean;
  notTaxInvoiceNote?: string;
  convexNs: "invoice" | "quotation" | "proforma";
  routes: {
    list: string;
    create: string;
    preview: string;
    edit: (id: string) => string;
    update: (id: string) => string;
  };
  conversions: { to: DocType; label: string }[];
}

export const DOC_META: Record<DocType, DocTypeMeta> = {
  invoice: {
    type: "invoice",
    docLabel: "Invoice",
    previewTitle: "Invoice",
    numberLabel: "Invoice No.",
    numberPrefix: "",
    numberField: "invoiceNo",
    statusModel: "boolean",
    statuses: [
      { value: "paid", label: "Paid", color: "green" },
      { value: "pending", label: "Pending", color: "amber" },
    ],
    showValidity: false,
    convexNs: "invoice",
    routes: {
      list: "/view_invoices",
      create: "/create_invoice",
      preview: "/preview_invoice",
      edit: (id) => `/create_invoice/${id}`,
      update: (id) => `/update_invoice/${id}`,
    },
    conversions: [],
  },
  quotation: {
    type: "quotation",
    docLabel: "Quotation",
    previewTitle: "QUOTATION",
    numberLabel: "Quotation No.",
    numberPrefix: "QUO",
    numberField: "quotationNo",
    statusModel: "enum",
    defaultStatus: "draft",
    statuses: [
      { value: "draft", label: "Draft", color: "gray" },
      { value: "sent", label: "Sent", color: "blue" },
      { value: "accepted", label: "Accepted", color: "green" },
      { value: "rejected", label: "Rejected", color: "red" },
      { value: "expired", label: "Expired", color: "amber" },
      { value: "converted", label: "Converted", color: "purple" },
    ],
    showValidity: true,
    convexNs: "quotation",
    routes: {
      list: "/view_quotations",
      create: "/create_quotation",
      preview: "/preview_quotation",
      edit: (id) => `/create_quotation/${id}`,
      update: (id) => `/update_quotation/${id}`,
    },
    conversions: [
      { to: "proforma", label: "Convert to Proforma" },
      { to: "invoice", label: "Convert to Invoice" },
    ],
  },
  proforma: {
    type: "proforma",
    docLabel: "Proforma Invoice",
    previewTitle: "PROFORMA INVOICE",
    numberLabel: "Proforma No.",
    numberPrefix: "PI",
    numberField: "proformaNo",
    statusModel: "enum",
    defaultStatus: "draft",
    statuses: [
      { value: "draft", label: "Draft", color: "gray" },
      { value: "sent", label: "Sent", color: "blue" },
      { value: "accepted", label: "Accepted", color: "green" },
      { value: "converted", label: "Converted", color: "purple" },
      { value: "cancelled", label: "Cancelled", color: "red" },
    ],
    showValidity: false,
    notTaxInvoiceNote: "This is not a tax invoice.",
    convexNs: "proforma",
    routes: {
      list: "/view_proformas",
      create: "/create_proforma",
      preview: "/preview_proforma",
      edit: (id) => `/create_proforma/${id}`,
      update: (id) => `/update_proforma/${id}`,
    },
    conversions: [{ to: "invoice", label: "Convert to Invoice" }],
  },
};

/** Statuses a user may set manually (excludes the conversion-only "converted"). */
export function manualStatuses(type: DocType): StatusOption[] {
  return DOC_META[type].statuses.filter((s) => s.value !== "converted");
}

export function docTypeFromPathname(pathname: string): DocType {
  if (pathname.includes("quotation")) return "quotation";
  if (pathname.includes("proforma")) return "proforma";
  return "invoice";
}
