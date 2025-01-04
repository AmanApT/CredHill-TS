import React, { FunctionComponent } from "react";
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
import { api } from "@/convex/_generated/api";
type EditItem ={
    invoiceId:unknown;
};

const DeleteInvoice: FunctionComponent<EditItem> = ({ invoiceId }) => {
  const deleteItem = useMutation(api.functions.invoice.deleteInvoice);
  const handleDelete = async (invoiceId: unknown)=>{
    await deleteItem({
      _id:invoiceId
    })
    toast("Invoice Deleted")
    // setTimeout(() => {
    //   location.reload();
    // }, 1000);
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <MdDelete size={"1.5rem"} color="red"/>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this invoice
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={()=>{handleDelete(invoiceId)}}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteInvoice;
