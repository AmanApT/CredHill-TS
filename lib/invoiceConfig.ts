/**
 * Invoice configuration types and defaults.
 *
 * Header fields: the top-of-invoice metadata (invoice no, date, venue, etc.)
 * Table columns: the line-item table columns (item, qty, rate, etc.)
 * Custom header fields: user-defined extra fields stored in the invoice's extraFields JSON blob.
 */

export type CustomFieldType = "text" | "number" | "date";

export interface HeaderFieldConfig {
  key: string;       // maps to invoice column name (invoiceNo, venue, approvalId, ref, date)
  label: string;     // user-visible label
  visible: boolean;
  core: boolean;     // core = maps to a fixed DB column; non-core = stored in extraFields
  required?: boolean;
}

export interface CustomHeaderFieldConfig {
  key: string;          // slug like "po_number"
  label: string;        // "PO Number"
  type: CustomFieldType;
}

export interface TableColumnConfig {
  key: string;       // matches TableRow key (item, gstRate, hsn, date, description, quantity, rate, amount, cgst, sgst, igst, total)
  label: string;
  visible: boolean;
  core: boolean;
}

export interface InvoiceConfigData {
  headerFields: HeaderFieldConfig[];
  tableColumns: TableColumnConfig[];
  customHeaderFields: CustomHeaderFieldConfig[];
}

// Defaults mirror the current hardcoded invoice layout — existing users see no change.
export const DEFAULT_HEADER_FIELDS: HeaderFieldConfig[] = [
  { key: "invoiceNo",  label: "Invoice No.",     visible: true, core: true, required: true },
  { key: "date",       label: "Invoice Date",    visible: true, core: true, required: true },
  { key: "venue",      label: "Venue",           visible: true, core: true },
  { key: "approvalId", label: "Approval ID",     visible: true, core: true },
  { key: "ref",        label: "Order Referred By", visible: true, core: true },
];

export const DEFAULT_TABLE_COLUMNS: TableColumnConfig[] = [
  { key: "item",        label: "Item Name",    visible: true, core: true },
  { key: "hsn",         label: "HSN/SAC",      visible: true, core: true },
  { key: "gstRate",     label: "GST Rate",     visible: true, core: true },
  { key: "date",        label: "Date",         visible: true, core: true },
  { key: "description", label: "Description",  visible: true, core: true },
  { key: "quantity",    label: "Quantity",     visible: true, core: true },
  { key: "rate",        label: "Rate",         visible: true, core: true },
  { key: "amount",      label: "Amount",       visible: true, core: true },
  { key: "cgst",        label: "CGST",         visible: true, core: true },
  { key: "sgst",        label: "SGST",         visible: true, core: true },
  { key: "igst",        label: "IGST",         visible: true, core: true },
  { key: "total",       label: "Total",        visible: true, core: true },
];

export const DEFAULT_CONFIG: InvoiceConfigData = {
  headerFields: DEFAULT_HEADER_FIELDS,
  tableColumns: DEFAULT_TABLE_COLUMNS,
  customHeaderFields: [],
};

// Fields/columns the user cannot hide (essential to an invoice being an invoice)
export const LOCKED_HEADER_KEYS = new Set(["invoiceNo", "date"]);
export const LOCKED_TABLE_KEYS = new Set(["item", "amount", "total"]);

/**
 * Parse a saved config record into typed config, filling in defaults for missing keys.
 * If the saved config is missing a default field (e.g. schema added a new core field later),
 * the missing default is appended so the user doesn't lose access to it.
 */
export function parseConfig(raw: {
  headerFields: string;
  tableColumns: string;
  customHeaderFields: string;
} | null | undefined): InvoiceConfigData {
  if (!raw) return DEFAULT_CONFIG;

  let headerFields: HeaderFieldConfig[] = DEFAULT_HEADER_FIELDS;
  let tableColumns: TableColumnConfig[] = DEFAULT_TABLE_COLUMNS;
  let customHeaderFields: CustomHeaderFieldConfig[] = [];

  try {
    const saved = JSON.parse(raw.headerFields) as HeaderFieldConfig[];
    // Merge: keep saved order, but add any new defaults not in saved
    const savedKeys = new Set(saved.map((f) => f.key));
    const additions = DEFAULT_HEADER_FIELDS.filter((f) => !savedKeys.has(f.key));
    headerFields = [...saved, ...additions];
  } catch {}

  try {
    const saved = JSON.parse(raw.tableColumns) as TableColumnConfig[];
    const savedKeys = new Set(saved.map((c) => c.key));
    const additions = DEFAULT_TABLE_COLUMNS.filter((c) => !savedKeys.has(c.key));
    tableColumns = [...saved, ...additions];
  } catch {}

  try {
    customHeaderFields = JSON.parse(raw.customHeaderFields) as CustomHeaderFieldConfig[];
  } catch {}

  return { headerFields, tableColumns, customHeaderFields };
}

/** Convert a label into a stable key slug (e.g. "PO Number" -> "po_number"). */
export function slugifyKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || `field_${Date.now()}`;
}
