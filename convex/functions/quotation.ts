import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Mirrors convex/functions/invoice.ts, with a lifecycle status string instead of
// the paid/pending boolean, plus a validity date. Conversion is handled in
// convex/functions/conversion.ts (which sets status -> "converted").

const QUOTATION_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "converted",
];

export const getQuotations = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quotation")
      .filter((q) => q.eq(q.field("billedBy"), args.email))
      .order("desc")
      .collect();
  },
});

export const addQuotation = mutation({
  args: {
    quotationNo: v.string(),
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
    status: v.optional(v.string()),
    validUntil: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("quotation")
      .withIndex("by_billedBy_quotationNo", (q) =>
        q.eq("billedBy", args.billedBy).eq("quotationNo", args.quotationNo)
      )
      .first();

    if (existing !== null) {
      throw new Error(`Quotation number "${args.quotationNo}" already exists.`);
    }

    const { status, ...rest } = args;
    return await ctx.db.insert("quotation", {
      ...rest,
      status: status ?? "draft",
    });
  },
});

export const updateQuotation = mutation({
  args: {
    _id: v.id("quotation"),
    quotationNo: v.optional(v.string()),
    venue: v.optional(v.string()),
    approvalId: v.optional(v.string()),
    date: v.optional(v.string()),
    ref: v.optional(v.string()),
    billedBy: v.optional(v.string()),
    clientId: v.optional(v.string()),
    totalAmount: v.optional(v.string()),
    tax: v.optional(v.string()),
    item: v.optional(v.string()),
    extraFields: v.optional(v.string()),
    status: v.optional(v.string()),
    validUntil: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { _id, ...rest } = args;
    // Only patch fields that were actually provided (avoid unsetting required cols).
    const patch = Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined)
    );
    return await ctx.db.patch(_id, patch);
  },
});

export const updateQuotationStatus = mutation({
  args: {
    _id: v.id("quotation"),
    status: v.string(),
    billedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args._id);
    if (!doc) throw new Error("Quotation not found");
    if (doc.billedBy !== args.billedBy) throw new Error("Not authorized");
    if (!QUOTATION_STATUSES.includes(args.status)) {
      throw new Error(`Invalid status "${args.status}"`);
    }
    // "converted" is only ever set by the conversion mutations.
    if (args.status === "converted") {
      throw new Error("Use 'Convert' to mark a quotation as converted.");
    }
    if (doc.status === "converted") {
      throw new Error("A converted quotation's status cannot be changed.");
    }
    await ctx.db.patch(args._id, { status: args.status });
    return { success: true };
  },
});

export const deleteQuotation = mutation({
  args: { _id: v.id("quotation") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args._id);
    if (doc && doc.status === "converted") {
      throw new Error(
        "Cannot delete a converted quotation. Delete its linked document first."
      );
    }
    await ctx.db.delete(args._id);
    return { success: true, message: "Quotation deleted successfully" };
  },
});
