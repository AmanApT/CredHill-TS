"use client";
import React, { FunctionComponent, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

type EachClient = {
  _id?: string;
  clientName: string;
  add: string;
  clientOf: string;
  email: string;
  city: string;
  pincode: string;
  contact: string;
  gst: string;
  pan: string;
};

type EditClientProps = {
  clientDetails: EachClient;
};

const EditClient: FunctionComponent<EditClientProps> = ({ clientDetails }) => {
  const [formData, setFormData] = useState(clientDetails);
  const updateClient = useMutation(api.functions.clients.updateClient);

  //   console.log(user?.email);
  //   const convex = useConvex();
  const handleInputChange = (key: keyof EachClient, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateClientDetails = async () => {
    try {
      await updateClient({
        _id: formData?._id,
        email: formData?.email,
        clientName: formData?.clientName,
        gst: formData?.gst,
        pan: formData?.pan,
        add: formData?.add,
        city: formData?.city,
        clientOf: formData?.clientOf,
        pincode: formData?.pincode,
        contact: formData?.contact,
      });

      toast("Client Updated Succesfully!");
      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error updating data:", error);
      toast("Error!");
    }
  };

  return (
    <div className="mb-2 absolute bottom-0 right-0 mx-4 cursor-pointer">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="bg-green-500">Edit Details</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit Client Details</SheetTitle>
            <SheetDescription>
              Make changes to the client profile here. Click save whene.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-left">
                Client Name
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  handleInputChange("clientName", e.target.value)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-left">
                Email
              </Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gst" className="text-left">
                GST
              </Label>
              <Input
                id="gst"
                value={formData.gst}
                onChange={(e) => handleInputChange("gst", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pan" className="text-left">
                PAN
              </Label>
              <Input
                id="pan"
                value={formData.pan}
                onChange={(e) => handleInputChange("pan", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add" className="text-left">
                Address
              </Label>
              <Input
                id="add"
                value={formData.add}
                onChange={(e) => handleInputChange("add", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-left">
                City
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pincode" className="text-left">
                Pincode
              </Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-left">
                Contact
              </Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange("contact", e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button
                className="mt-4"
                type="button"
                onClick={updateClientDetails}
              >
                Update Details
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EditClient;
