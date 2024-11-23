"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useConvex, useMutation } from "convex/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const AccountInfo = () => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const { user } = useKindeBrowserClient();
  const convex = useConvex();
  const updateAccount = useMutation(api.functions.account.updateAccount);

  const [accountDetails, setAccountDetails] = useState({
    bankName: "",
    email: "",
    ifsc: "",
    accountNo: "",
    branch: "",
    _id: "",
  });

  const handleInputChange = (
    value: string | number,
    field: string | number
  ) => {
    setAccountDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };
  const getBankDetails = async () => {
    try {
      const result = await convex.query(api.functions.account.getBankDetails, {
        email: user?.email,
      });
      if (result && result.length > 0) {
        setAccountDetails(result[0]); // Update state with the first result
      } else {
        console.warn("No user found with this email");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
    }
  };
  useEffect(() => {
    if (user?.email) {
      getBankDetails();
    }
  }, [user]);
  const updateData = async () => {
    try {
      if (editMode) {
        await updateAccount({
          _id: accountDetails?._id,
          email: accountDetails?.email,
          bankName: accountDetails?.bankName,
          ifsc: accountDetails?.ifsc,
          branch: accountDetails?.branch,
          accountNo: accountDetails?.accountNo,
        });

        toast("Data Updated Succesfully!");
      }
    } catch (error) {
      console.error("Error updating data:", error);
      toast("Error!");
    }
  };

  return (
    <section className="p-8 pt-0">
      <div className="flex justify-between">
        <h3 className="text-2xl my-6 ">Account Info</h3>
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
      </div>
      <div className="flex justify-between">
        <div className="w-[40%] ">
          <p className="text-sm text-gray-700">Bank Name</p>
          <Input
            onChange={(e) => {
              handleInputChange(e.target.value, "bankName");
            }}
            disabled={!editMode}
            value={accountDetails?.bankName}
            className="mt-2 bg-slate-50 "
            placeholder=" Bank Name"
          />
        </div>
        <div className="w-[40%] ">
          <p className="text-sm text-gray-700">Account No</p>
          <Input
            onChange={(e) => {
              handleInputChange(e.target.value, "accountNo");
            }}
            value={accountDetails?.accountNo}
            type="email"
            className="mt-2 bg-slate-50 "
            placeholder="Account No"
            disabled={!editMode}
          />
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <div className="w-[40%] ">
          <p className="text-sm text-gray-700">Branch</p>
          <Input
            onChange={(e) => {
              handleInputChange(e.target.value, "branch");
            }}
            disabled={!editMode}
            value={accountDetails?.branch}
            //   type=""
            className="mt-2 bg-slate-50 "
            placeholder="Branch"
          />
        </div>
        <div className="w-[40%]">
          <p className="text-sm text-gray-700">IFSC Code</p>
          <Input
            onChange={(e) => {
              handleInputChange(e.target.value, "ifsc");
            }}
            disabled={!editMode}
            value={accountDetails?.ifsc}
            className="mt-2 bg-slate-50 "
            placeholder="IFSC Code"
          />
        </div>
      </div>
    </section>
  );
};

export default AccountInfo;
