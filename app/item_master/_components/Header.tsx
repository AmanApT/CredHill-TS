"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useMutation } from "convex/react";
import Link from "next/link";
// import { useRouter } from 'next/router';
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Header = () => {
  const { user } = useKindeBrowserClient();

  const [itemDetails, setItemDetails] = useState({
    itemName: "",
    hsn: "",
    email: "",
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const addClients = useMutation(api.functions.items.addItem);
  const createItem = () => {
    if (itemDetails?.itemName.length < 1) {
      toast("Enter Item Name");
      return;
    }
    addClients({
      itemName: itemDetails?.itemName,
      email: itemDetails?.email,
      hsn: itemDetails?.hsn,
    });
    setItemDetails({
      itemName: "",
      email: user?.email,
      hsn: "",
    });
    setIsOpen(!isOpen);

    toast("Item Added!");
    setTimeout(()=>{
      location.reload()
    },1500)
  };

  useEffect(() => {
    setItemDetails((prev) => ({
      ...prev,
      email: user?.email,
    }));
  }, [user]);

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open); // Update dialog state
    if (!open) {
      // Reset state when dialog closes
      setItemDetails({
        itemName: "",
        hsn: "",
      
        email: user?.email,
      
      });
    }
  };
  const handleItemDetails = (
    value: string | number,
    field: string | number
  ) => {
    setItemDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };
  
  return (
    <header className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 py-2 sm:px-2 sm:py-4 lg:px-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Item Master
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center justify-center gap-1.5 rounded border border-gray-200 bg-white px-5 py-3 text-gray-900 transition hover:text-gray-700 focus:outline-none focus:ring"
              type="button"
            >
              <Link href="/dashboard">
                <span className="text-sm font-medium"> Dashboard </span>
              </Link>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>

            <Dialog open={isOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger onClick={() => setIsOpen(true)} asChild>
                <Button className="bg-green-600">Add Item</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
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
                      required={true}
                      id="name"
                      placeholder="Item Name"
                      className="col-span-3"
                      value={itemDetails?.itemName}
                      onChange={(e) => {
                        handleItemDetails(e.target.value, "itemName");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-left">
                      HSN/SAC Code
                    </Label>
                    <Input
                      required={true}
                      id="email"
                      placeholder="HSN/SAC Code"
                      className="col-span-3"
                      value={itemDetails?.hsn}
                      onChange={(e) => {
                        handleItemDetails(e.target.value, "hsn");
                      }}
                    />
                  </div>
                </div>

                <Button onClick={createItem} type="submit">
                  Add Item
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
