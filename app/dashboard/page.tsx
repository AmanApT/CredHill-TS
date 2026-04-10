"use client";
import React, { useEffect, useState } from "react";
import Header from "./_components/Header";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";



import { InvoiceSummaryCards } from "./_components/InvoiceSummaryCards";
import { ClientWiseInvoicesChart } from "./_components/ClientWiseInvoicesChart";
import { PendingInvoicesByClientChart } from "./_components/PendingInvoicesByClientChart";
import { ClientWiseRevenueChart } from "./_components/ClientWiseRevenueChart";
import { ClientWisePendingPaymentChart } from "./_components/ClientWisePendingPaymentChart";
import { RevenueTimelineChart } from "./_components/RevenueTimelineChart";
import { RecentInvoices } from "./_components/RecentInvoices";
import { DateRangeFilter } from "./_components/DateRangeFilter";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { usePathname } from 'next/navigation'
import { getDateRange, FilterType, DateRange, getFilterDisplayText, getOldestInvoiceDate } from "@/lib/dateUtils";
import { Calendar, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

type ChartKey = "timeline" | "clientInvoices" | "pendingInvoices" | "clientRevenue" | "clientPending" | "recentActivity";

interface ChartOption {
  key: ChartKey;
  label: string;
}

const ALL_CHARTS: ChartOption[] = [
  { key: "timeline", label: "Revenue & Invoices Timeline" },
  { key: "clientInvoices", label: "Client-Wise Invoices" },
  { key: "pendingInvoices", label: "Pending Invoices by Client" },
  { key: "clientRevenue", label: "Client-Wise Revenue" },
  { key: "clientPending", label: "Client-Wise Pending Payment" },
  { key: "recentActivity", label: "Recent Activity" },
];

const Dashboard = () => {
  const pathname = usePathname();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("month");
  const [customStartDate, setCustomStartDate] = useState<string>();
  const [customEndDate, setCustomEndDate] = useState<string>();
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange("month"));
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<ChartKey[]>(["timeline", "clientRevenue", "recentActivity"]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allClients, setAllClients] = useState<{ _id: string; clientName: string }[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [showClientFilter, setShowClientFilter] = useState(false);

  const toggleChart = (key: ChartKey) => {
    setSelectedCharts((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleFilterChange = (filterType: FilterType, customStart?: string, customEnd?: string) => {
    setSelectedFilter(filterType);
    if (filterType === "custom" && customStart && customEnd) {
      setCustomStartDate(customStart);
      setCustomEndDate(customEnd);
      setDateRange({ startDate: new Date(customStart), endDate: new Date(customEnd) });
    } else if (filterType === "all") {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
      const startDate = getOldestInvoiceDate(invoices ?? []);
      setDateRange({ startDate, endDate: new Date() });
    } else {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
      setDateRange(getDateRange(filterType));
    }
  };


  const {setInvoiceFormData,setCompanyDetails,setTableRows, invoices} = useInvoiceContext();

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
  const { setInvoices } = useInvoiceContext()
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
      convex.query(api.functions.clients.getClients, { email: user.email }).then(setAllClients as any);
    }
  }, [user]);

  // Recompute "all time" start date once invoices are loaded
  useEffect(() => {
    if (selectedFilter === "all" && invoices && invoices.length > 0) {
      const startDate = getOldestInvoiceDate(invoices);
      setDateRange({ startDate, endDate: new Date() });
    }
  }, [invoices, selectedFilter]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      {/* Main Dashboard Container */}
      <div className="px-4 py-2">
        {/* Summary Cards - Top */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="section-heading text-gray-900">Invoice Summary</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
                {moment(dateRange.startDate).format("DD MMM YYYY")} — {moment(dateRange.endDate).format("DD MMM YYYY")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowDateFilter(!showDateFilter); setShowClientFilter(false); }}
                className="gap-2"
                title={showDateFilter ? "Hide date filter" : "Filter by date"}
              >
                <Calendar className="h-4 w-4" />
                {showDateFilter ? "Hide" : "Date"}
              </Button>

              {/* Client Filter */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowClientFilter(!showClientFilter); setShowDateFilter(false); }}
                  className={`gap-2 ${selectedClientIds.length > 0 ? "border-orange-400 text-orange-600 bg-orange-50" : ""}`}
                >
                  <Users className="h-4 w-4" />
                  {selectedClientIds.length === 0
                    ? "Clients"
                    : selectedClientIds.length === allClients.length
                    ? "All Clients"
                    : `${selectedClientIds.length} Client${selectedClientIds.length > 1 ? "s" : ""}`}
                  <ChevronDown className={`h-3 w-3 transition-transform ${showClientFilter ? "rotate-180" : ""}`} />
                </Button>

                {showClientFilter && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowClientFilter(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                      {/* Select All */}
                      <button
                        onClick={() =>
                          setSelectedClientIds(
                            selectedClientIds.length === allClients.length
                              ? []
                              : allClients.map((c) => c._id)
                          )
                        }
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 transition-colors"
                      >
                        <span className={`flex items-center justify-center w-4 h-4 rounded border flex-shrink-0 ${
                          selectedClientIds.length === allClients.length
                            ? "bg-orange-500 border-orange-500 text-white"
                            : selectedClientIds.length > 0
                            ? "bg-orange-100 border-orange-400"
                            : "border-gray-300"
                        }`}>
                          {selectedClientIds.length === allClients.length && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {selectedClientIds.length > 0 && selectedClientIds.length < allClients.length && (
                            <span className="w-2 h-2 bg-orange-400 rounded-sm block" />
                          )}
                        </span>
                        <span className="font-medium text-gray-700">All Clients</span>
                      </button>

                      {/* Individual clients */}
                      <div className="max-h-52 overflow-y-auto">
                        {allClients.map((client) => {
                          const isSelected = selectedClientIds.includes(client._id);
                          return (
                            <button
                              key={client._id}
                              onClick={() =>
                                setSelectedClientIds((prev) =>
                                  isSelected
                                    ? prev.filter((id) => id !== client._id)
                                    : [...prev, client._id]
                                )
                              }
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                            >
                              <span className={`flex items-center justify-center w-4 h-4 rounded border flex-shrink-0 ${
                                isSelected ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300"
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <span className={isSelected ? "text-gray-900 font-medium" : "text-gray-600"}>
                                {client.clientName}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Clear */}
                      {selectedClientIds.length > 0 && (
                        <button
                          onClick={() => setSelectedClientIds([])}
                          className="w-full px-4 py-2 text-xs text-orange-600 hover:bg-orange-50 border-t border-gray-100 transition-colors"
                        >
                          Clear selection
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Date Range Filter - Toggleable (Below Heading) */}
          {showDateFilter && (
            <div className="my-4">
              <DateRangeFilter
                selectedFilter={selectedFilter}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}

          {/* Summary Cards */}
          <InvoiceSummaryCards dateRange={dateRange} selectedClientIds={selectedClientIds} />
        </div>

        {/* Chart Selector Dropdown */}
        <div className="mb-6 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 shadow-sm transition-colors"
          >
            Graphs ({selectedCharts.length} selected)
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                {ALL_CHARTS.map((option) => {
                  const isActive = selectedCharts.includes(option.key);
                  return (
                    <button
                      key={option.key}
                      onClick={() => toggleChart(option.key)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className={`flex items-center justify-center w-4 h-4 rounded border ${
                        isActive ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                      }`}>
                        {isActive && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className={isActive ? "text-gray-900 font-medium" : "text-gray-600"}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Charts - Rendered in order based on selection */}
        {selectedCharts.includes("timeline") && (
          <div className="mb-4">
            <RevenueTimelineChart dateRange={dateRange} selectedClientIds={selectedClientIds} />
          </div>
        )}

        {/* Pair up side-by-side charts */}
        {(selectedCharts.includes("clientInvoices") || selectedCharts.includes("pendingInvoices")) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            {selectedCharts.includes("clientInvoices") && <ClientWiseInvoicesChart dateRange={dateRange} selectedClientIds={selectedClientIds} />}
            {selectedCharts.includes("pendingInvoices") && <PendingInvoicesByClientChart dateRange={dateRange} selectedClientIds={selectedClientIds} />}
          </div>
        )}

        {(selectedCharts.includes("clientRevenue") || selectedCharts.includes("clientPending")) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            {selectedCharts.includes("clientRevenue") && <ClientWiseRevenueChart dateRange={dateRange} selectedClientIds={selectedClientIds} />}
            {selectedCharts.includes("clientPending") && <ClientWisePendingPaymentChart dateRange={dateRange} selectedClientIds={selectedClientIds} />}
          </div>
        )}

        {selectedCharts.includes("recentActivity") && (
          <div className="mb-4">
            <h2 className="section-heading text-gray-900 mb-4">Recent Activity</h2>
            <RecentInvoices dateRange={dateRange} selectedClientIds={selectedClientIds} />
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
