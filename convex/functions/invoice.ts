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
      .collect();
    return result;
  },
});

export const addInvoice = mutation({
  args: {
    invoiceNo: v.string(),
    venue: v.string(),
    approvalId: v.string(),
    date: v.string(),
    ref : v.string(),
    billedBy: v.string(),
    clientId: v.string(),
    totalAmount: v.string(),
    tax: v.string(),
    invoiceStatus: v.boolean(),
    item:v.string()

  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("invoice", args);
  },
});

// export const updateInvoice = mutation({
//   args: {
//     _id: v.id("client"),
//     clientName: v.string(),
//     email: v.string(),
//     gst: v.string(),
//     pan: v.string(),
//     clientOf : v.string(),
//     add: v.string(),
//     city: v.string(),
//     pincode: v.string(),
//     contact: v.string(),
//   },
//   handler: async (ctx, args) => {
//     return await ctx.db.patch(args._id, {
//       clientName: args.clientName,
//       gst: args.gst,
//       pan: args.pan,

//       add: args.add,
//       city: args.city,
//       pincode: args.pincode,
//       contact: args.contact,
//       clientOf : args.clientOf
//     });
//   },
// });
