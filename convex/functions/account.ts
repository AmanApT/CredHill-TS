import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getBankDetails = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args_0) => {
    const result = await ctx.db
      .query("account")
      .filter((q) => q.eq(q.field("email"), args_0.email))
      .collect();
    return result;
  },
});

export const addAccount = mutation({
  args: {
    bankName: v.string(),
    accountNo: v.string(),
    ifsc: v.string(),
    branch: v.string(),
    
    email: v.string(),
 
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("account", args);
  },
});

export const updateAccount = mutation({
  args: {
    _id: v.id("account"),
    bankName: v.string(),
    accountNo: v.string(),
    ifsc: v.string(),
    branch: v.string(),
    
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, {
        bankName: args.bankName,
        email:args.email,
        branch:args.branch,
        ifsc:args.ifsc,
        accountNo:args.accountNo
       
    });
  },
});
