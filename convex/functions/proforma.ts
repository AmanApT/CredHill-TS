import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Mirrors convex/functions/quotation.ts. A proforma may originate from a
// quotation (source linkage) and may be converted to a tax invoice (target
// linkage) — both handled in convex/functions/conversion.ts.

const PROFORMA_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "converted",
  "cancelled",
];

export const getProformas = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("proforma")
      .filter((q) => q.eq(q.field("billedBy"), args.email))
      .order("desc")
      .collect();
  },
});

export const addProforma = mutation({
  args: {
    proformaNo: v.string(),
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
    sourceType: v.optional(v.string()),
    sourceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("proforma")
      .withIndex("by_billedBy_proformaNo", (q) =>
        q.eq("billedBy", args.billedBy).eq("proformaNo", args.proformaNo)
      )
      .first();

    if (existing !== null) {
      throw new Error(`Proforma number "${args.proformaNo}" already exists.`);
    }

    const { status, ...rest } = args;
    return await ctx.db.insert("proforma", {
      ...rest,
      status: status ?? "draft",
    });
  },
});

export const updateProforma = mutation({
  args: {
    _id: v.id("proforma"),
    proformaNo: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const { _id, ...rest } = args;
    const patch = Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined)
    );
    return await ctx.db.patch(_id, patch);
  },
});

export const updateProformaStatus = mutation({
  args: {
    _id: v.id("proforma"),
    status: v.string(),
    billedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args._id);
    if (!doc) throw new Error("Proforma not found");
    if (doc.billedBy !== args.billedBy) throw new Error("Not authorized");
    if (!PROFORMA_STATUSES.includes(args.status)) {
      throw new Error(`Invalid status "${args.status}"`);
    }
    if (args.status === "converted") {
      throw new Error("Use 'Convert' to mark a proforma as converted.");
    }
    if (doc.status === "converted") {
      throw new Error("A converted proforma's status cannot be changed.");
    }
    await ctx.db.patch(args._id, { status: args.status });
    return { success: true };
  },
});

export const deleteProforma = mutation({
  args: { _id: v.id("proforma") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args._id);
    if (doc && doc.status === "converted") {
      throw new Error(
        "Cannot delete a converted proforma. Delete its linked invoice first."
      );
    }
    await ctx.db.delete(args._id);
    return { success: true, message: "Proforma deleted successfully" };
  },
});
