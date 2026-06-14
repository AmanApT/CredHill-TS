import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  invoicePreferences: defineTable({
    email: v.string(),
    themeColor: v.string(),
    accentColor: v.string(),
    fontSize: v.string(),
  }).index("by_email", ["email"]),

  invoiceConfig: defineTable({
    email: v.string(),
    headerFields: v.string(), // JSON: [{ key, label, visible, required?, core }]
    tableColumns: v.string(), // JSON: [{ key, label, visible, core }]
    customHeaderFields: v.string(), // JSON: [{ key, label, type }]
  }).index("by_email", ["email"]),

  user: defineTable({
    companyName: v.string(),
    email: v.string(),
    gst: v.string(),
    pan: v.string(),
    add: v.string(),
    city: v.string(),
    pincode: v.string(),
    contact: v.string(),
    logoUrl: v.string(),
    stampUrl: v.string(),
  }),

  account: defineTable({
    bankName: v.string(),
    accountNo: v.string(),
    ifsc: v.string(),
    branch: v.string(),
    email: v.string(),
  }),

  client: defineTable({
    clientName: v.string(),
    email: v.string(),
    gst: v.string(),
    pan: v.string(),
    clientOf: v.string(),
    add: v.string(),
    city: v.string(),
    pincode: v.string(),
    contact: v.string(),
  }),

  items: defineTable({
    itemName: v.string(),
    email: v.string(),
    hsn: v.string(),
  }),

  invoice: defineTable({
    invoiceNo: v.string(),
    venue: v.string(),
    approvalId: v.string(),
    date: v.string(),
    ref: v.string(),
    billedBy: v.string(),
    clientId: v.string(),
    totalAmount: v.string(),
    tax: v.string(),
    invoiceStatus: v.boolean(),
    item: v.string(),
    extraFields: v.optional(v.string()), // JSON: key-value of custom header fields
    // Conversion linkage — set only when this invoice was created by converting
    // a quotation/proforma. Additive & optional; addInvoice never sets these.
    sourceType: v.optional(v.string()), // "quotation" | "proforma"
    sourceId: v.optional(v.string()),
  })
    .index("by_invoiceNo", ["invoiceNo"])
    .index("by_billedBy", ["billedBy"])
    .index("by_billedBy_invoiceNo", ["billedBy", "invoiceNo"]),

  // Quotation: a pre-sale price offer. Mirrors invoice's shared fields, swaps the
  // paid/pending boolean for a lifecycle status, adds a validity date + conversion
  // linkage to the proforma/invoice it became.
  quotation: defineTable({
    quotationNo: v.string(), // "QUO/2025-26/001"
    venue: v.string(),
    approvalId: v.string(),
    date: v.string(),
    ref: v.string(),
    billedBy: v.string(), // owner email
    clientId: v.string(),
    totalAmount: v.string(),
    tax: v.string(),
    item: v.string(), // JSON: TableRow[]
    extraFields: v.optional(v.string()),
    status: v.string(), // draft | sent | accepted | rejected | expired | converted
    validUntil: v.optional(v.string()),
    // Target linkage (where this quotation was converted to)
    convertedToType: v.optional(v.string()), // "proforma" | "invoice"
    convertedToId: v.optional(v.string()),
    convertedAt: v.optional(v.string()),
  })
    .index("by_quotationNo", ["quotationNo"])
    .index("by_billedBy", ["billedBy"])
    .index("by_billedBy_quotationNo", ["billedBy", "quotationNo"])
    .index("by_billedBy_status", ["billedBy", "status"]),

  // Proforma invoice: a preliminary (non-tax) invoice. Same shape as quotation,
  // with both source linkage (the quotation it came from) and target linkage
  // (the tax invoice it became).
  proforma: defineTable({
    proformaNo: v.string(), // "PI/2025-26/001"
    venue: v.string(),
    approvalId: v.string(),
    date: v.string(),
    ref: v.string(),
    billedBy: v.string(),
    clientId: v.string(),
    totalAmount: v.string(),
    tax: v.string(),
    item: v.string(),
    extraFields: v.optional(v.string()),
    status: v.string(), // draft | sent | accepted | converted | cancelled
    // Source linkage (where this proforma was converted from)
    sourceType: v.optional(v.string()), // "quotation"
    sourceId: v.optional(v.string()),
    // Target linkage (where this proforma was converted to)
    convertedToType: v.optional(v.string()), // "invoice"
    convertedToId: v.optional(v.string()),
    convertedAt: v.optional(v.string()),
  })
    .index("by_proformaNo", ["proformaNo"])
    .index("by_billedBy", ["billedBy"])
    .index("by_billedBy_proformaNo", ["billedBy", "proformaNo"])
    .index("by_billedBy_status", ["billedBy", "status"]),
});
