import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  invoicePreferences: defineTable({
    email: v.string(),
    themeColor: v.string(),
    accentColor: v.string(),
    fontSize: v.string(),
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
  })
    .index("by_invoiceNo", ["invoiceNo"])
    .index("by_billedBy", ["billedBy"])
    .index("by_billedBy_invoiceNo", ["billedBy", "invoiceNo"]),
});
