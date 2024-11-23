import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
export const getUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args_0) => {
    const result = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("email"), args_0.email))
      .collect();
    return result;
  },
});

export const addUser = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("user", args);
  },
});

export const updateUser = mutation({
  args: {
    _id: v.id("user"),
    email: v.string(), // Identifier for the user
    companyName: v.string(),
    gst: v.string(),
    pan: v.string(),
    // name: v.number(),
    add: v.string(),
    city: v.string(),
    pincode: v.string(),
    contact: v.string(),
    logoUrl: v.string(),
    stampUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, {
      companyName: args.companyName,
      gst: args.gst,
      pan: args.pan,

      add: args.add,
      city: args.city,
      pincode: args.pincode,
      contact: args.contact,
      logoUrl: args.logoUrl,
      stampUrl: args.stampUrl,
    });
  },
});
