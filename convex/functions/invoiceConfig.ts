import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getConfig = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("invoiceConfig")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const saveConfig = mutation({
  args: {
    email: v.string(),
    headerFields: v.string(),
    tableColumns: v.string(),
    customHeaderFields: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("invoiceConfig")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        headerFields: args.headerFields,
        tableColumns: args.tableColumns,
        customHeaderFields: args.customHeaderFields,
      });
    }
    return await ctx.db.insert("invoiceConfig", args);
  },
});
