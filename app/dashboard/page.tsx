"use client";
import React, { useEffect } from "react";
import Header from "./_components/Header";
import Invoices from "./_components/Invoices";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";


const Dashboard = () => {
  const { user } = useKindeBrowserClient();
  const convex = useConvex();
  console.log("HIIIII")
  const addUser = useMutation(api.functions.user.addUser);
  // const addAccount = useMutation(api.functions.account.addAccount);
  const addAccount = useMutation(api.functions.account.addAccount)

  const checkUser = async () => {
    const result = await convex.query(api.functions.user.getUser, { email: user?.email });
    if (!result.length) {
      addUser({
        companyName: "",
        email:user?.email,
        gst: "",
        pan: "",
        // name: v.string(),
        add: "",
        city: "",
        pincode: "",
        contact: "",
        logoUrl: "",
        stampUrl: "",
      }).then((res) => {
        console.log(res);
      });
      addAccount({
        bankName: "",
        email:user?.email,
        branch: "",
        ifsc: "",
        accountNo: "",

      })
    }
  };
  useEffect(() => {
    if (user) {
      checkUser();
    }
  }, [user]);
 
  return (
    <section>
      <Header />
      <div className="p-5 flex gap-4">
        <Link href="/clients">
          <Button>Manage Clients</Button>
        </Link>
        <Link href="/item_master">
        <Button className="bg-red-400">Item Master</Button>
        </Link>
     
      </div>
      <Invoices />
    </section>
  );
};

export default Dashboard;
