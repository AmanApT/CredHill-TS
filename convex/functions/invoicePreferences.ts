import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getPreferences = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("invoicePreferences")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const savePreferences = mutation({
  args: {
    email: v.string(),
    themeColor: v.string(),
    accentColor: v.string(),
    fontSize: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("invoicePreferences")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        themeColor: args.themeColor,
        accentColor: args.accentColor,
        fontSize: args.fontSize,
      });
    }
    return await ctx.db.insert("invoicePreferences", args);
  },
});
