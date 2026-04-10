import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  invoicePreferences: defineTable({
    email: v.string(),
    themeColor: v.string(),
    accentColor: v.string(),
    fontSize: v.string(),
  }).index("by_email", ["email"]),

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
  })
    .index("by_invoiceNo", ["invoiceNo"])
    .index("by_billedBy", ["billedBy"])
    .index("by_billedBy_invoiceNo", ["billedBy", "invoiceNo"]),
});
