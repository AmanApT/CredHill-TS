import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getInvoices = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args_0) => {
    const result = await ctx.db
      .query("invoice")
      .filter((q) => q.eq(q.field("billedBy"), args_0.email))
      .order("desc").collect();
    return result;
  },
});

export const addInvoice = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("invoice", args);
  },
});

export const updateInvoice = mutation({
  args: {
    _id: v.id("invoice"), // The ID of the invoice to be updated

    invoiceNo: v.optional(v.string()),
    venue: v.optional(v.string()),
    approvalId: v.optional(v.string()),
    date: v.optional(v.string()),
    ref: v.optional(v.string()),
    billedBy: v.optional(v.string()),
    clientId: v.optional(v.string()),
    totalAmount: v.optional(v.string()),
    tax: v.optional(v.string()),
    invoiceStatus: v.optional(v.boolean()),
    item: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
   return await ctx.db.patch(args._id,{

    invoiceNo: args.invoiceNo,
    venue: args.venue,
    approvalId: args.approvalId,
    date: args.date,
    ref: args.ref,
    billedBy: args.billedBy,
    clientId: args.clientId,
    totalAmount: args.totalAmount,
    tax: args.tax,
    invoiceStatus: args.invoiceStatus,
    item: args.item,
   })
  },
});
export const deleteInvoice = mutation({
  args: {
    _id: v.id("invoice"), // The ID of the item to delete
  },
  handler: async (ctx, args) => {
    // Delete the invoice from the "invoice" collection using the provided ID
    await ctx.db.delete(args._id);
    return { success: true, message: "Invoice deleted successfully" };
  },
});