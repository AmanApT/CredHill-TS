import React, { FunctionComponent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
type EachItem = {
  itemName: string;
  hsn: string;
  email: string;
};

type EditEachItem = {
  clientDetails: EachItem;
};
const EditItem: FunctionComponent<EditEachItem> = ({ itemDetails }) => {
    const [isDialogOpen, setDialogOpen] = useState(false); // State for dialog open/close


  const [itemForm, setItemForm] = useState({
    itemName: itemDetails?.itemName,
   
    hsn: itemDetails?.hsn,
  });

  const updateItem = useMutation(api.functions.items.updateItem);


  console.log(itemDetails);
  const handleItemInput = (value: string, key: keyof EachItem) => {
    setItemForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const updateItemDetails = async () => {
    try {
      await updateItem({
        _id: itemDetails?._id,
        email: itemDetails?.email,
        itemName:itemForm?.itemName,
        hsn:itemForm?.hsn,
      });

      toast("Item Updated Succesfully!");
      setDialogOpen(false); 
      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error updating data:", error);
      toast("Error!");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setDialogOpen(true)} variant="outline">Edit / View </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Added items show up while creating invoices.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left">
              Item Name
            </Label>
            <Input
              id="name"
              onChange={(e) => {
                handleItemInput(e.target.value, "itemName");
              }}
              value={itemForm?.itemName}
              placeholder="Item Name"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-left">
              HSN / SAC Code
            </Label>
            <Input
              id="username"
              onChange={(e) => {
                handleItemInput(e.target.value, "hsn");
              }}
              value={itemForm?.hsn}
              placeholder="HSN / SAC Code"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={updateItemDetails} type="submit">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItem;
