"use client";
import React, { useEffect, useState } from "react";
import Header from "./_components/Header";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";



import { InvoiceSummaryCards } from "./_components/InvoiceSummaryCards";
import { ClientWiseInvoicesChart } from "./_components/ClientWiseInvoicesChart";
import { PendingInvoicesByClientChart } from "./_components/PendingInvoicesByClientChart";
import { RecentInvoices } from "./_components/RecentInvoices";
import { DateRangeFilter } from "./_components/DateRangeFilter";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { usePathname } from 'next/navigation'
import { getDateRange, FilterType, DateRange } from "@/lib/dateUtils";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const pathname = usePathname();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("month");
  const [customStartDate, setCustomStartDate] = useState<string>();
  const [customEndDate, setCustomEndDate] = useState<string>();
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange("month"));
  const [showDateFilter, setShowDateFilter] = useState(false);

  const handleFilterChange = (filterType: FilterType, customStart?: string, customEnd?: string) => {
    setSelectedFilter(filterType);
    if (filterType === "custom" && customStart && customEnd) {
      setCustomStartDate(customStart);
      setCustomEndDate(customEnd);
      const startDate = new Date(customStart);
      const endDate = new Date(customEnd);
      setDateRange({ startDate, endDate });
    } else {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
      setDateRange(getDateRange(filterType));
    }
  };


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
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      {/* Main Dashboard Container */}
      <div className="p-4">
        {/* Summary Cards - Top */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Invoice Summary</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="gap-2"
              title={showDateFilter ? "Hide filter" : "Show filter"}
            >
              <Calendar className="h-4 w-4" />
              {showDateFilter ? "Hide" : "Filter"}
            </Button>
          </div>

          {/* Date Range Filter - Toggleable (Below Heading) */}
          {showDateFilter && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
              <DateRangeFilter
                selectedFilter={selectedFilter}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}

          {/* Summary Cards */}
          <InvoiceSummaryCards dateRange={dateRange} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ClientWiseInvoicesChart dateRange={dateRange} />
          <PendingInvoicesByClientChart dateRange={dateRange} />
        </div>

        {/* Recent Invoices */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <RecentInvoices dateRange={dateRange} />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
