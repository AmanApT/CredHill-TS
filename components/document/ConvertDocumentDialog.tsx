"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useConvex, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { CONVERSION_CONVEX } from "@/lib/documentConvex";
import { DOC_META, DocType } from "@/lib/documentConfig";

type SourceType = "quotation" | "proforma";

/**
 * Confirms and runs a document conversion (Quotation→Proforma/Invoice,
 * Proforma→Invoice), then pre-loads the target into context and navigates to
 * the new document so the user can review/print it.
 */
export function ConvertDocumentDialog({
  sourceId,
  from,
  to,
  label,
  disabled,
  trigger,
}: {
  sourceId: string;
  from: SourceType;
  to: DocType;
  label: string;
  disabled?: boolean;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const convex = useConvex();
  const { user } = useKindeBrowserClient();
  const { setInvoices, setProformas } = useInvoiceContext();
  const [isConverting, setIsConverting] = useState(false);

  // Hooks must be unconditional — bind all three, pick at call time.
  const quotationToProforma = useMutation(CONVERSION_CONVEX.quotationToProforma);
  const quotationToInvoice = useMutation(CONVERSION_CONVEX.quotationToInvoice);
  const proformaToInvoice = useMutation(CONVERSION_CONVEX.proformaToInvoice);

  const pickMutation = () => {
    if (from === "quotation" && to === "proforma") return quotationToProforma;
    if (from === "quotation" && to === "invoice") return quotationToInvoice;
    return proformaToInvoice; // proforma -> invoice
  };

  const handleConvert = async () => {
    const email = user?.email;
    if (!email) return;
    setIsConverting(true);
    try {
      const result: any = await pickMutation()({
        sourceId: sourceId as any,
        billedBy: email,
      });

      // Pre-populate the target's context list so the destination edit screen
      // (the existing invoice form reads invoices from context) finds it.
      if (to === "invoice") {
        const list = await convex.query(api.functions.invoice.getInvoices, { email });
        setInvoices(list as any);
      } else if (to === "proforma") {
        const list = await convex.query(api.functions.proforma.getProformas, { email });
        setProformas(list as any);
      }

      toast.success(`Created ${DOC_META[to].docLabel} ${result?.targetNo ?? ""}`.trim());
      router.push(DOC_META[to].routes.edit(result.targetId));
    } catch (err: any) {
      toast(err?.message ?? "Conversion failed", {
        style: { backgroundColor: "red", color: "white" },
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" disabled={disabled}>
            {label}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This creates a new {DOC_META[to].docLabel.toLowerCase()} with all the
            same line items, and marks this {from} as converted. The {from} can no
            longer be edited afterwards.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConverting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConvert} disabled={isConverting}>
            {isConverting ? "Converting…" : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
