"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useConvex, useMutation } from "convex/react";
import { toast } from "sonner";
// import { useToast } from "@/hooks/use-toast"
// import { toast, useToast } from "@/hooks/use-toast";
// import { useToast } from "@/hooks/use-toast";
const Profile = () => {
  const { user } = useKindeBrowserClient();
  // const { toast } = useToast();
  const updateFile = useMutation(api.functions.user.updateUser);

  //   console.log(user?.email);
  const convex = useConvex();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [profileDetails, setProfileDetails] = useState({
    companyName: "",
    email: "",
    gst: "",
    pan: "",
    add: "",
    city: "",
    pincode: "",
    contact: "",
    logoUrl: "",
    stampUrl: "",
    _id: "",
  });
  const updateData = async () => {
    try {
      if (editMode) {
        await updateFile({
          _id: profileDetails?._id,
          email: profileDetails?.email,
          companyName: profileDetails?.companyName,
          gst: profileDetails?.gst,
          pan: profileDetails?.pan,
          add: profileDetails?.add,
          city: profileDetails?.city,
          pincode: profileDetails?.pincode,
          contact: profileDetails?.contact,
          logoUrl: profileDetails?.logoUrl,
          stampUrl: profileDetails?.stampUrl,
        });

        toast("Data Updated Succesfully!");
      }
    } catch (error) {
      console.error("Error updating data:", error);
      toast("Error!");
    }
  };

  const getUser = async () => {
    if (!user?.email) return; // Skip if email is not available
    try {
      const result = await convex.query(api.functions.user.getUser, {
        email: user?.email,
      });
      if (result && result.length > 0) {
        setProfileDetails(result[0]); // Update state with the first result
      } else {
        console.warn("No user found with this email");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
    }
  };
  const handleInputChange = (
    value: string | number,
    field: string | number
  ) => {
    setProfileDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  useEffect(() => {
    getUser();
  }, [user]);

  return (
    <section className="p-8">
    
      <header className="flex justify-between ">
        <div className="flex gap-4 justify-center items-center">
          <Image
            className="rounded-full aspect-square"
            src={
              profileDetails?.logoUrl === ""
                ? "https://m.media-amazon.com/images/I/61RXJRnF0yL._AC_UF1000,1000_QL80_.jpg"
                : profileDetails?.logoUrl
            }
            alt="Kanha Ji Painting"
            width={70}
            height={70} // Replace with the actual height of the image
            style={{ objectFit: "cover" }} // Optional for styling
          />
          <div>
            <p className="font-bold">{profileDetails?.companyName}</p>
            <p className="text-gray-700">{profileDetails?.email}</p>
          </div>
        </div>
        <div className="flex gap-4">

      
        {editMode && (
            <Button
            className="bg-slate-400"
              onClick={() => {
                setEditMode(false);
              }}
            >
              Cancel
            </Button>
          )}
        <Button
          onClick={() => {
            setEditMode(!editMode);
            updateData();
          }}
          className={editMode ? `bg-green-500` : `bg-blue-500`}
        >
          {editMode ? "Save" : "Edit"}
        </Button>
       
        </div>
      </header>
      <section className="flex flex-col gap-6 mt-4">
        <div className="flex justify-between">
          <div className="w-[40%] ">
            <p className="text-sm text-gray-700">Company Name</p>
            <Input
              onChange={(e) => {
                handleInputChange(e.target.value, "companyName");
              }}
              disabled={!editMode}
              value={profileDetails?.companyName}
              className="mt-2 bg-slate-50 "
              placeholder="Your Company Name"
            />
          </div>
          <div className="w-[40%] ">
            <p className="text-sm text-gray-700">Email Id</p>
            <Input
              onChange={(e) => {
                handleInputChange(e.target.value, "email");
              }}
              value={profileDetails?.email}
              type="email"
              className="mt-2 bg-slate-50 "
              placeholder="Your Email"
              disabled={!editMode}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-[40%] ">
            <p className="text-sm text-gray-700">Contact</p>
            <Input
              onChange={(e) => {
                handleInputChange(e.target.value, "contact");
              }}
              disabled={!editMode}
              value={profileDetails?.contact}
              //   type=""
              className="mt-2 bg-slate-50 "
              placeholder="Contact No"
            />
          </div>
          <div className="w-[40%] ">
            <p className="text-sm text-gray-700">GST</p>
            <Input
              onChange={(e) => {
                handleInputChange(e.target.value, "gst");
              }}
              disabled={!editMode}
              value={profileDetails?.gst}
              className="mt-2 bg-slate-50 "
              placeholder="GST"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-[40%] ">
            <p className="text-sm text-gray-700">PAN</p>
            <Input
              onChange={(e) => {
                handleInputChange(e.target.value, "pan");
              }}
              disabled={!editMode}
              value={profileDetails?.pan}
              className="mt-2 bg-slate-50 "
              placeholder="PAN"
            />
          </div>
          <div className="w-[40%] ">
            <p className="text-sm text-gray-700">Address</p>
            <Input
              onChange={(e) => {
                handleInputChange(e.target.value, "add");
              }}
              disabled={!editMode}
              value={profileDetails?.add}
              className="mt-2 bg-slate-50 "
              placeholder="Address"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="w-[40%] ">
            <p className="text-sm text-gray-700">City</p>
            <Input
              onChange={(e) => {
                handleInputChange(e.target.value, "city");
              }}
              disabled={!editMode}
              value={profileDetails?.city}
              className="mt-2 bg-slate-50 "
              placeholder="City"
            />
          </div>
          <div className="w-[40%] ">
            <p className="text-sm text-gray-700">PINCODE</p>
            <Input
              onChange={(e) => {
                handleInputChange(e.target.value, "pincode");
              }}
              disabled={!editMode}
              value={profileDetails?.pincode}
              className="mt-2 bg-slate-50 "
              placeholder="Pincode"
            />
          </div>
        </div>
        <div className="h-25">
          <Input
            onChange={(e) => {
              handleInputChange(e.target.value, "logoUrl");
            }}
            value={profileDetails?.logoUrl}
            disabled={!editMode}
            placeholder="Image URL"
          />
        </div>
      </section>
    </section>
  );
};

export default Profile;
