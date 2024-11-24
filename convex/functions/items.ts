import { query, mutation } from "../_generated/server";
import { v } from "convex/values";


export const getItems = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args_0) => {
    const result = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("email"), args_0.email))
      .collect();
    return result;
  },
});

export const addItem = mutation({
  args: {
    itemName: v.string(),
    email: v.string(),
    hsn: v.string(),
  

  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("items", args);
  },
});

export const updateItem = mutation({
  args: {
    _id: v.id("items"),
    itemName: v.string(),
    email: v.string(),
    hsn: v.string(),
  
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, {
        itemName: args.itemName,
        email: args.email,
        hsn: args.hsn,
    });
  },
});
export const deleteItem = mutation({
  args: {
    _id: v.id("items"), // The ID of the item to delete
  },
  handler: async (ctx, args) => {
    // Delete the item from the "items" collection using the provided ID
    await ctx.db.delete(args._id);
    return { success: true, message: "Item deleted successfully" };
  },
});
