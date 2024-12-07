"use client";
import Link from "next/link";
// import { useRouter } from 'next/router';
import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { toast } from "sonner";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
const Header = () => {
  const { user } = useKindeBrowserClient();
  useEffect(() => {
    setClientDetails((prev) => ({
      ...prev,
      clientOf: user?.email,
    }));
  }, [user]);
  const [clientDetails, setClientDetails] = useState({
    clientName: "",
    add: "",
    gst: "",
    pan: "",
    clientOf: user?.email,
    city: "",
    pincode: "",
    contact: "",
    email: "",
  });
  const [isOpen, setIsOpen] = useState(false);


  const addClients = useMutation(api.functions.clients.addClients);
  const createClient = () => {
    if (clientDetails?.clientName.length < 3) {
      toast("Enter Client Name");
      return;
    }
    addClients({
      clientName: clientDetails?.clientName,
      email: clientDetails?.email,
      gst: clientDetails?.gst,
      pan: clientDetails?.pan,
      clientOf: clientDetails?.clientOf,
      add: clientDetails?.add,
      city: clientDetails?.city,
      pincode: clientDetails?.pincode,
      contact: clientDetails?.contact,
    });
    setClientDetails({
      clientName: "",
      add: "",
      gst: "",
      pan: "",
      clientOf: user?.email,
      city: "",
      pincode: "",
      contact: "",
      email: "",
    });
    setIsOpen(!isOpen);
    
    toast("Client Added!");
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open); // Update dialog state
    if (!open) {
      // Reset state when dialog closes
      setClientDetails({
        clientName: "",
        add: "",
        gst: "",
        pan: "",
        clientOf: user?.email,
        city: "",
        pincode: "",
        contact: "",
        email: "",
      });
    }
  };
  const handleClientDetails = (
    value: string | number,
    field: string | number
  ) => {
    setClientDetails((prevDetails) => ({
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
              Manage Clients
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
              <DialogTrigger  onClick={() => setIsOpen(true)} asChild>
                <Button className="py-6" variant="outline">Create New Client</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle className="">Create New Client</DialogTitle>
                  <DialogDescription>
                    Fill all the client details here!
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-left">
                      Client Name
                    </Label>
                    <Input
                      required={true}
                      id="name"
                      placeholder="Client Name"
                      className="col-span-3"
                      value={clientDetails?.clientName}
                      onChange={(e) => {
                        handleClientDetails(e.target.value, "clientName");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-left">
                      Email
                    </Label>
                    <Input
                      required={true}
                      id="email"
                      placeholder="Email"
                      className="col-span-3"
                      value={clientDetails?.email}
                      onChange={(e) => {
                        handleClientDetails(e.target.value, "email");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-left">
                      Address
                    </Label>
                    <Input
                      id="username"
                      placeholder="Address Here"
                      className="col-span-3"
                      value={clientDetails?.add}
                      onChange={(e) => {
                        handleClientDetails(e.target.value, "add");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-left">
                      City
                    </Label>
                    <Input
                      id="username"
                      placeholder="City"
                      className="col-span-3"
                      value={clientDetails?.city}
                      onChange={(e) => {
                        handleClientDetails(e.target.value, "city");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-left">
                      PIN CODE
                    </Label>
                    <Input
                      type="number"
                      id="username"
                      placeholder="Pin Code"
                      className="col-span-3"
                      value={clientDetails?.pincode}
                      onChange={(e) => {
                        handleClientDetails(e.target.value, "pincode");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-left">
                      Contact
                    </Label>
                    <Input
                      id="username"
                      placeholder="Contact No"
                      className="col-span-3"
                      value={clientDetails?.contact}
                      onChange={(e) => {
                        handleClientDetails(e.target.value, "contact");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-left">
                      GSTIN
                    </Label>
                    <Input
                      id="username"
                      placeholder="GST Number"
                      className="col-span-3"
                      value={clientDetails?.gst}
                      onChange={(e) => {
                        handleClientDetails(e.target.value, "gst");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-left">
                      PAN
                    </Label>
                    <Input
                      id="username"
                      placeholder="PAN Number"
                      className="col-span-3"
                      value={clientDetails?.pan}
                      onChange={(e) => {
                        handleClientDetails(e.target.value, "pan");
                      }}
                    />
                  </div>
                </div>

                <Button onClick={createClient} type="submit">
                  Create Client
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
