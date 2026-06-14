import { mutation, MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// Atomic document conversions. Convex mutations run with serializable isolation,
// so each conversion (allocate number -> insert target -> mark source converted)
// either fully commits or not at all, and concurrent conversions of the same
// source conflict and re-run (preventing double-conversion / duplicate numbers).

// ── Numbering helpers (kept local so convex stays self-contained; mirror
//    lib/documentUtils.ts). new Date() is allowed inside mutations. ──────────
function getIndianFY(date: Date): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 3) return `${year}-${String(year + 1).slice(2)}`;
  return `${year - 1}-${String(year).slice(2)}`;
}

function formatDocNo(prefix: string, fy: string, num: number): string {
  const padded = String(num).padStart(3, "0");
  return prefix ? `${prefix}/${fy}/${padded}` : `${fy}/${padded}`;
}

function parseDocNo(stored: string): number {
  if (!stored) return 0;
  const parts = stored.split("/");
  return parseInt(parts[parts.length - 1], 10) || 0;
}

function parseDocFY(stored: string): string | null {
  if (!stored) return null;
  const parts = stored.split("/");
  return parts.length >= 2 ? parts[parts.length - 2] : null;
}

async function nextInvoiceNo(ctx: MutationCtx, billedBy: string): Promise<string> {
  const fy = getIndianFY(new Date());
  const docs = await ctx.db
    .query("invoice")
    .withIndex("by_billedBy", (q) => q.eq("billedBy", billedBy))
    .collect();
  let max = 0;
  for (const d of docs) {
    if (parseDocFY(d.invoiceNo) === fy) max = Math.max(max, parseDocNo(d.invoiceNo));
  }
  return formatDocNo("", fy, max + 1);
}

async function nextProformaNo(ctx: MutationCtx, billedBy: string): Promise<string> {
  const fy = getIndianFY(new Date());
  const docs = await ctx.db
    .query("proforma")
    .withIndex("by_billedBy", (q) => q.eq("billedBy", billedBy))
    .collect();
  let max = 0;
  for (const d of docs) {
    if (parseDocFY(d.proformaNo) === fy) max = Math.max(max, parseDocNo(d.proformaNo));
  }
  return formatDocNo("PI", fy, max + 1);
}

const today = () => new Date().toISOString().split("T")[0];
const now = () => new Date().toISOString();

// ── Quotation -> Proforma ────────────────────────────────────────────────────
export const convertQuotationToProforma = mutation({
  args: { sourceId: v.id("quotation"), billedBy: v.string() },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Quotation not found");
    if (source.billedBy !== args.billedBy) throw new Error("Not authorized");
    if (source.status === "converted") {
      throw new Error("This quotation has already been converted.");
    }
    if (source.status === "rejected" || source.status === "expired") {
      throw new Error(`Cannot convert a ${source.status} quotation.`);
    }

    const proformaNo = await nextProformaNo(ctx, args.billedBy);
    const targetId = await ctx.db.insert("proforma", {
      proformaNo,
      venue: source.venue,
      approvalId: source.approvalId,
      date: today(),
      ref: source.ref,
      billedBy: source.billedBy,
      clientId: source.clientId,
      totalAmount: source.totalAmount,
      tax: source.tax,
      item: source.item,
      extraFields: source.extraFields,
      status: "draft",
      sourceType: "quotation",
      sourceId: args.sourceId,
    });

    await ctx.db.patch(args.sourceId, {
      status: "converted",
      convertedToType: "proforma",
      convertedToId: targetId,
      convertedAt: now(),
    });

    return { targetId, targetNo: proformaNo };
  },
});

// ── Quotation -> Invoice ─────────────────────────────────────────────────────
export const convertQuotationToInvoice = mutation({
  args: { sourceId: v.id("quotation"), billedBy: v.string() },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Quotation not found");
    if (source.billedBy !== args.billedBy) throw new Error("Not authorized");
    if (source.status === "converted") {
      throw new Error("This quotation has already been converted.");
    }
    if (source.status === "rejected" || source.status === "expired") {
      throw new Error(`Cannot convert a ${source.status} quotation.`);
    }

    const invoiceNo = await nextInvoiceNo(ctx, args.billedBy);
    const targetId = await ctx.db.insert("invoice", {
      invoiceNo,
      venue: source.venue,
      approvalId: source.approvalId,
      date: today(),
      ref: source.ref,
      billedBy: source.billedBy,
      clientId: source.clientId,
      totalAmount: source.totalAmount,
      tax: source.tax,
      invoiceStatus: false,
      item: source.item,
      extraFields: source.extraFields,
      sourceType: "quotation",
      sourceId: args.sourceId,
    });

    await ctx.db.patch(args.sourceId, {
      status: "converted",
      convertedToType: "invoice",
      convertedToId: targetId,
      convertedAt: now(),
    });

    return { targetId, targetNo: invoiceNo };
  },
});

// ── Proforma -> Invoice ──────────────────────────────────────────────────────
export const convertProformaToInvoice = mutation({
  args: { sourceId: v.id("proforma"), billedBy: v.string() },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Proforma not found");
    if (source.billedBy !== args.billedBy) throw new Error("Not authorized");
    if (source.status === "converted") {
      throw new Error("This proforma has already been converted.");
    }
    if (source.status === "cancelled") {
      throw new Error("Cannot convert a cancelled proforma.");
    }

    const invoiceNo = await nextInvoiceNo(ctx, args.billedBy);
    const targetId = await ctx.db.insert("invoice", {
      invoiceNo,
      venue: source.venue,
      approvalId: source.approvalId,
      date: today(),
      ref: source.ref,
      billedBy: source.billedBy,
      clientId: source.clientId,
      totalAmount: source.totalAmount,
      tax: source.tax,
      invoiceStatus: false,
      item: source.item,
      extraFields: source.extraFields,
      sourceType: "proforma",
      sourceId: args.sourceId,
    });

    await ctx.db.patch(args.sourceId, {
      status: "converted",
      convertedToType: "invoice",
      convertedToId: targetId,
      convertedAt: now(),
    });

    return { targetId, targetNo: invoiceNo };
  },
});

// ── Delete an invoice, unlinking its source so the source isn't left dangling
//    in "converted" state. Separate from the existing invoice.deleteInvoice
//    (which is left untouched) — the UI uses this for converted invoices. ─────
export const deleteInvoiceWithUnlink = mutation({
  args: { _id: v.id("invoice"), billedBy: v.string() },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args._id);
    if (!inv) return { success: true, message: "Invoice already deleted" };
    if (inv.billedBy !== args.billedBy) throw new Error("Not authorized");

    if (inv.sourceType === "quotation" && inv.sourceId) {
      const src = await ctx.db.get(inv.sourceId as Id<"quotation">);
      if (src && src.convertedToId === args._id) {
        await ctx.db.patch(src._id, {
          status: "accepted",
          convertedToType: undefined,
          convertedToId: undefined,
          convertedAt: undefined,
        });
      }
    } else if (inv.sourceType === "proforma" && inv.sourceId) {
      const src = await ctx.db.get(inv.sourceId as Id<"proforma">);
      if (src && src.convertedToId === args._id) {
        await ctx.db.patch(src._id, {
          status: "accepted",
          convertedToType: undefined,
          convertedToId: undefined,
          convertedAt: undefined,
        });
      }
    }

    await ctx.db.delete(args._id);
    return { success: true, message: "Invoice deleted successfully" };
  },
});
