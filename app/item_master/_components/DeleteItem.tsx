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
  itemId:unknown;
};

const DeleteItem: FunctionComponent<EditItem> = ({ itemId }) => {
  const deleteItem = useMutation(api.functions.items.deleteItem);
  const handleDelete = async (itemId: unknown)=>{
    await deleteItem({
      _id:itemId
    })
    toast("Item Deleted")
    setTimeout(() => {
      location.reload();
    }, 1000);
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
            This action cannot be undone. This will permanently delete this item
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={()=>{handleDelete(itemId)}}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteItem;
