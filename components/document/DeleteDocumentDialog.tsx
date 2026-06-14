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
import { MdDelete } from "react-icons/md";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { DOC_CONVEX } from "@/lib/documentConvex";
import { DOC_META } from "@/lib/documentConfig";

type NewDocType = "quotation" | "proforma";

/** Generic delete dialog for quotations/proformas (mirrors DeleteInvoice). */
export function DeleteDocumentDialog({
  docType,
  id,
}: {
  docType: NewDocType;
  id: string;
}) {
  const remove = useMutation(DOC_CONVEX[docType].remove as any);
  const label = DOC_META[docType].docLabel;

  const handleDelete = async () => {
    try {
      await remove({ _id: id as any });
      toast(`${label} deleted`);
    } catch (err: any) {
      toast(err?.message ?? "Could not delete", {
        style: { backgroundColor: "red", color: "white" },
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <MdDelete size={"1.5rem"} color="red" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this{" "}
            {label.toLowerCase()}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
