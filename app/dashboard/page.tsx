"use client";
import React, { useEffect,  } from "react";
import Header from "./_components/Header";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
// import ApexChart from "./_components/ApexChart";

import DashboardBoxes from "./_components/DashboardBoxes";

import hero from "@/assets/hero.png";
import client from "@/assets/client.jpg";
import invoicesImage from "@/assets/invoices.jpg";
import inventory from "@/assets/inventory.jpg";
// import TotalAmountCard from "./_components/TotalAmountCard";
import { Donut } from "./_components/Donut";
import { Graph } from "./_components/Graph";
import { BarChartGraph } from "./_components/BarChartGraph";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { usePathname } from 'next/navigation'
const Dashboard = () => {
  const pathname = usePathname()
  const staticData = [
    {
      title: "Create Polished Invoices Effortlessly",
      desc: "Effeciently identify your client needs and cater your invoices accordingly",
      cta: "Create Invoice",
      ctaColor: "green",
      href: "/create_invoice",
      image: hero,
    },
    {
      title: "Manage Clients Effeciently",
      desc: "Client Management tool lets you create/update client details",
      cta: "Manage Clients",
      ctaColor: "red",
      href: "/clients",
      image: client,
    },
    {
      title: "View and Manage Invoices",
      desc: "Manage, edit and check status of your invoices",
      cta: "Manage Invoices",
      ctaColor: "red",
      href: "/view_invoices",
      image: invoicesImage,
    },
    {
      title: "Item Master",
      desc: "Inventory Management at your fingertips!!",
      cta: "Go to Inventory",
      ctaColor: "red",
      href: "/item_master",
      image: inventory,
    },
  ];
  const {setInvoiceFormData,setCompanyDetails,setTableRows} = useInvoiceContext();

  useEffect(() => {
    if (pathname.includes('dashboard')) {
        setInvoiceFormData({
          invoiceNo: "",
          venue: "",
          referredBy: "",
          date: new Date().toISOString().split("T")[0],
          approvalId: "",
        })
        setCompanyDetails({
          billedBy: {
            companyName: "",
            email: "",
            gstin: "",
            pan: "",
            companyAddress: "",
            city: "",
            pincode: "",
            contact: "",
           
            logoUrl: "",
            stampUrl: "",
          },
          billedTo: {
            clientId: "",
            clientName: "",
            email: "",
            gst: "",
            pan: "",
            clientOf : "",
            add: "",
            city: "",
            pincode: "",
            contact: "",
          },
          accountInfo: {
            bankName: "",
            email: "",
            ifsc: "",
            accountNo: "",
            branch: "",
          },
        })
        setTableRows([ {
          hsn:"",
          item: "",
          gstRate: 18,
          date: new Date().toISOString().split("T")[0],
          description: "",
          quantity: 0,
          rate: 0,
          amount: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 0,
        },])
    }
}, [pathname]);
  const { setInvoices} = useInvoiceContext()
  const { user } = useKindeBrowserClient();
  // const [invoices, setInvoices] = useState<[]>();
  const convex = useConvex();
  console.log("HIIIII");
  const addUser = useMutation(api.functions.user.addUser);

  const addAccount = useMutation(api.functions.account.addAccount);
  const getAllInvoices = async () => {
    const result = await convex.query(api.functions.invoice.getInvoices, {
      email: user?.email ?? "",
    });
    console.log(result,"invoices");
    setInvoices(result);
  };

  const checkUser = async () => {
    const result = await convex.query(api.functions.user.getUser, {
      email: user?.email,
    });
    if (!result.length) {
      addUser({
        companyName: "",
        email: user?.email,
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
        email: user?.email,
        branch: "",
        ifsc: "",
        accountNo: "",
      });
    }
  };
  useEffect(() => {
    if (user) {
      checkUser();
    }
    if (user?.email !== undefined) {
      getAllInvoices();
    }
  }, [user]);

  return (
    <section className="bg-slate-100 ">
      <Header />
      {/* <div className="p-5 flex gap-4 ">
        <Link href="/clients">
          <Button>Manage Clients</Button>
        </Link>
        <Link href="/item_master">
          <Button className="bg-red-400">Item Master</Button>
        </Link>
      </div> */}
      <div className="flex justify-between p-5">
        <DashboardBoxes data={staticData[0]} />
        <DashboardBoxes data={staticData[1]} />
      </div>
      <div className="flex justify-between p-5">
        <DashboardBoxes data={staticData[2]} />
        <DashboardBoxes data={staticData[3]} />
      </div>
      <div className="flex justify-between p-4">
       {/* <TotalAmountCard /> */}
     <BarChartGraph />
     <Graph />
     <Donut />
      </div>

      {/* <Invoices invoices = {invoices} /> */}
    </section>
  );
};

export default Dashboard;
