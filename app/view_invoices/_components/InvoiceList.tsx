"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import DeleteInvoice from "./DeleteInvoice";
import { formatIndianNumber } from "@/lib/invoiceUtils";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { toast } from "sonner";
import { Calendar, CheckCircle, Clock, X, Users, ChevronDown } from "lucide-react";
import { getDateRange, filterInvoicesByDateRange, filterInvoicesByClients, FilterType, DateRange } from "@/lib/dateUtils";
import { DateRangeFilter } from "@/app/dashboard/_components/DateRangeFilter";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const InvoiceList = () => {
  const rowsPerPage = 10;
  const { invoices, setInvoices } = useInvoiceContext();
  const { user } = useKindeBrowserClient();
  const convex = useConvex();
  const bulkUpdateStatus = useMutation(api.functions.invoice.bulkUpdatePaymentStatus);

  const [localInvoices, setLocalInvoices] = useState(invoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);

  // Date range filter state
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [customStartDate, setCustomStartDate] = useState<string>();
  const [customEndDate, setCustomEndDate] = useState<string>();
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange("all"));
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Client filter state
  const [allClients, setAllClients] = useState<{ _id: string; clientName: string }[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [showClientFilter, setShowClientFilter] = useState(false);

  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(rowsPerPage);

  useEffect(() => {
    if (user?.email) {
      convex.query(api.functions.clients.getClients, { email: user.email }).then(
        (clients) => setAllClients(clients as unknown as { _id: string; clientName: string }[])
      );
    }
  }, [convex, user?.email]);

  const handleFilterChange = (filterType: FilterType, customStart?: string, customEnd?: string) => {
    setSelectedFilter(filterType);
    if (filterType === "custom" && customStart && customEnd) {
      setCustomStartDate(customStart);
      setCustomEndDate(customEnd);
      setDateRange({
        startDate: new Date(customStart),
        endDate: new Date(customEnd),
      });
    } else {
      setDateRange(getDateRange(filterType));
    }
  };

  const searchItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  };

  // Combined search, date, client, and status filter logic
  useEffect(() => {
    let filtered = invoices || [];

    // Apply date range filter
    if (selectedFilter !== "all") {
      filtered = filterInvoicesByDateRange(filtered, dateRange);
    }

    // Apply client filter
    filtered = filterInvoicesByClients(filtered, selectedClientIds);

    // Apply search filter
    if (searchTerm !== "") {
      filtered = filtered.filter((eachInvoice) =>
        eachInvoice?.invoiceNo?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply payment status filter
    if (paymentStatusFilter === "paid") {
      filtered = filtered.filter((eachInvoice) => eachInvoice?.invoiceStatus === true);
    } else if (paymentStatusFilter === "pending") {
      filtered = filtered.filter((eachInvoice) => eachInvoice?.invoiceStatus === false);
    }

    setLocalInvoices(filtered);
    setStartIndex(0);
    setEndIndex(rowsPerPage);
    // Clear selection when filters change
    setSelectedIds(new Set());
  }, [invoices, searchTerm, paymentStatusFilter, dateRange, selectedFilter, selectedClientIds]);

  // Get currently visible invoices (current page)
  const visibleInvoices = localInvoices?.slice(startIndex, endIndex) || [];

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    // Select/deselect all FILTERED invoices (not just current page)
    if (selectedIds.size === localInvoices?.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(localInvoices?.map((inv: any) => inv._id) || []);
      setSelectedIds(allIds);
    }
  };

  const handleBulkStatusUpdate = async (status: boolean) => {
    if (selectedIds.size === 0 || !user?.email) return;

    setIsUpdating(true);
    try {
      const result = await bulkUpdateStatus({
        invoiceIds: Array.from(selectedIds) as any,
        invoiceStatus: status,
        billedBy: user.email,
      });
      toast.success(
        `${result.updatedCount} invoice(s) marked as ${status ? "Paid" : "Unpaid"}`
      );
      setSelectedIds(new Set());
      // Refresh invoices from database
      const refreshed = await convex.query(api.functions.invoice.getInvoices, {
        email: user.email ?? "",
      });
      setInvoices(refreshed as any);
    } catch (error: any) {
      toast.error(error.message || "Failed to update invoices");
    } finally {
      setIsUpdating(false);
    }
  };

  const isAllSelected = localInvoices?.length > 0 && selectedIds.size === localInvoices?.length;

  return (
    <div className="relative overflow-x-auto rounded-xl border border-gray-100 shadow-sm p-5 bg-white">
      <div className="pb-4 bg-white dark:bg-gray-900">
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Payment Status Filter */}
          <div className="flex gap-2 items-center">
            <span className="label-text text-gray-600 flex items-center">Status:</span>
            <Button
              onClick={() => setPaymentStatusFilter("all")}
              variant={paymentStatusFilter === "all" ? "default" : "outline"}
              size="sm"
            >
              All
            </Button>
            <Button
              onClick={() => setPaymentStatusFilter("pending")}
              variant={paymentStatusFilter === "pending" ? "default" : "outline"}
              size="sm"
              className={paymentStatusFilter === "pending" ? "bg-yellow-600" : ""}
            >
              Unpaid
            </Button>
            <Button
              onClick={() => setPaymentStatusFilter("paid")}
              variant={paymentStatusFilter === "paid" ? "default" : "outline"}
              size="sm"
              className={paymentStatusFilter === "paid" ? "bg-green-600" : ""}
            >
              Paid
            </Button>
          </div>

          {/* Date Filter Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowDateFilter(!showDateFilter); setShowClientFilter(false); }}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              {showDateFilter ? "Hide" : "Date Filter"}
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
                            <span className={`text-left ${isSelected ? "text-gray-900 font-medium" : "text-gray-600"}`}>
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

        {/* Date Range Filter */}
        {showDateFilter && (
          <div className="mb-4">
            <DateRangeFilter
              selectedFilter={selectedFilter}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}

        {/* Search */}
        <label className="sr-only">Search</label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <Input
            type="text"
            id="table-search"
            onChange={(e) => searchItem(e)}
            className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for items"
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-800">
              {selectedIds.size} invoice{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 gap-1"
              onClick={() => handleBulkStatusUpdate(true)}
              disabled={isUpdating}
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Paid
            </Button>
            <Button
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 gap-1"
              onClick={() => handleBulkStatusUpdate(false)}
              disabled={isUpdating}
            >
              <Clock className="h-4 w-4" />
              Mark as Unpaid
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <table className="w-full text-left text-gray-600">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th scope="col" className="px-4 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer"
              />
            </th>
            <th scope="col" className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">
              Invoice No
            </th>
            <th scope="col" className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">
              Invoice Date
            </th>
            <th scope="col" className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">
              Total Amount
            </th>
            <th scope="col" className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">
              Taxes
            </th>
            <th scope="col" className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">
              Updated At
            </th>
            <th scope="col" className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">
              Payment Status
            </th>
            <th scope="col" className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>

        {invoices?.length != 0 && (
          <>
            <tbody>
              {visibleInvoices?.map((eachInvoice: any) => {
                const isSelected = selectedIds.has(eachInvoice?._id);
                return (
                  <tr
                    key={eachInvoice?._creationTime}
                    className={`border-b border-gray-50 transition-colors ${
                      isSelected
                        ? "bg-blue-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(eachInvoice?._id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3.5 table-content font-medium text-gray-900 whitespace-nowrap">
                      {eachInvoice?.invoiceNo}
                    </td>
                    <td className="px-4 py-3.5 table-content text-gray-600">
                      {moment(eachInvoice?.date).format("DD MMM YYYY")}
                    </td>
                    <td className="px-4 py-3.5 table-content text-gray-900 font-medium">₹{formatIndianNumber(eachInvoice?.totalAmount)}</td>
                    <td className="px-4 py-3.5 table-content text-gray-600">₹{formatIndianNumber(eachInvoice?.tax)}</td>
                    <td className="px-4 py-3.5 table-content text-gray-500">
                      {moment(eachInvoice?._creationTime).format("DD MMM YYYY")}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full small-text font-medium ${
                          eachInvoice?.invoiceStatus
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {eachInvoice?.invoiceStatus ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 flex items-center gap-3">
                      <Link href={`create_invoice/${eachInvoice?._id}`}>
                        <Button size="sm" className="h-8 px-3 label-text">Edit/View</Button>
                      </Link>
                      <DeleteInvoice invoiceId={eachInvoice?._id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </>
        )}
      </table>
      {invoices?.length != 0 && (
        <div className="flex justify-center">
          <Pagination className="m-2 w-[95%] cursor-pointer">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={
                    startIndex === 0 ? "pointer-events-none opacity-50" : undefined
                  }
                  onClick={() => {
                    setStartIndex(startIndex - rowsPerPage);
                    setEndIndex(endIndex - rowsPerPage);
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className={
                    endIndex >= (localInvoices?.length || 0)
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={() => {
                    setStartIndex(startIndex + rowsPerPage);
                    setEndIndex(endIndex + rowsPerPage);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      {invoices?.length == 0 && (
        <>
          {" "}
          <div className="flex flex-col p-8 items-center justify-center  ">
            <svg
              className="mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              width="154"
              height="161"
              viewBox="0 0 154 161"
              fill="none"
            >
              <path
                d="M0.0616455 84.4268C0.0616455 42.0213 34.435 7.83765 76.6507 7.83765C118.803 7.83765 153.224 42.0055 153.224 84.4268C153.224 102.42 147.026 118.974 136.622 132.034C122.282 150.138 100.367 161 76.6507 161C52.7759 161 30.9882 150.059 16.6633 132.034C6.25961 118.974 0.0616455 102.42 0.0616455 84.4268Z"
                fill="#FEF3E2"
              />
              <path
                d="M96.8189 0.632498L96.8189 0.632384L96.8083 0.630954C96.2034 0.549581 95.5931 0.5 94.9787 0.5H29.338C22.7112 0.5 17.3394 5.84455 17.3394 12.4473V142.715C17.3394 149.318 22.7112 154.662 29.338 154.662H123.948C130.591 154.662 135.946 149.317 135.946 142.715V38.9309C135.946 38.0244 135.847 37.1334 135.648 36.2586L135.648 36.2584C135.117 33.9309 133.874 31.7686 132.066 30.1333C132.066 30.1331 132.065 30.1329 132.065 30.1327L103.068 3.65203C103.068 3.6519 103.067 3.65177 103.067 3.65164C101.311 2.03526 99.1396 0.995552 96.8189 0.632498Z"
                fill="white"
                stroke="#FEF3E2"
              />
              <ellipse
                cx="80.0618"
                cy="81"
                rx="28.0342"
                ry="28.0342"
                fill="#FEF3E2"
              />
              <path
                d="M99.2393 61.3061L99.2391 61.3058C88.498 50.5808 71.1092 50.5804 60.3835 61.3061C49.6423 72.0316 49.6422 89.4361 60.3832 100.162C71.109 110.903 88.4982 110.903 99.2393 100.162C109.965 89.4363 109.965 72.0317 99.2393 61.3061ZM105.863 54.6832C120.249 69.0695 120.249 92.3985 105.863 106.785C91.4605 121.171 68.1468 121.171 53.7446 106.785C39.3582 92.3987 39.3582 69.0693 53.7446 54.683C68.1468 40.2965 91.4605 40.2966 105.863 54.6832Z"
                stroke="#E5E7EB"
              />
              <path
                d="M110.782 119.267L102.016 110.492C104.888 108.267 107.476 105.651 109.564 102.955L118.329 111.729L110.782 119.267Z"
                stroke="#E5E7EB"
              />
              <path
                d="M139.122 125.781L139.122 125.78L123.313 109.988C123.313 109.987 123.313 109.987 123.312 109.986C121.996 108.653 119.849 108.657 118.521 109.985L118.871 110.335L118.521 109.985L109.047 119.459C107.731 120.775 107.735 122.918 109.044 124.247L109.047 124.249L124.858 140.06C128.789 143.992 135.191 143.992 139.122 140.06C143.069 136.113 143.069 129.728 139.122 125.781Z"
                fill="#FAB12F"
                stroke="#FAB12F"
              />
              <path
                d="M83.185 87.2285C82.5387 87.2285 82.0027 86.6926 82.0027 86.0305C82.0027 83.3821 77.9987 83.3821 77.9987 86.0305C77.9987 86.6926 77.4627 87.2285 76.8006 87.2285C76.1543 87.2285 75.6183 86.6926 75.6183 86.0305C75.6183 80.2294 84.3831 80.2451 84.3831 86.0305C84.3831 86.6926 83.8471 87.2285 83.185 87.2285Z"
                fill="#FAB12F"
              />
              <path
                d="M93.3528 77.0926H88.403C87.7409 77.0926 87.2049 76.5567 87.2049 75.8946C87.2049 75.2483 87.7409 74.7123 88.403 74.7123H93.3528C94.0149 74.7123 94.5509 75.2483 94.5509 75.8946C94.5509 76.5567 94.0149 77.0926 93.3528 77.0926Z"
                fill="#FAB12F"
              />
              <path
                d="M71.5987 77.0925H66.6488C65.9867 77.0925 65.4507 76.5565 65.4507 75.8945C65.4507 75.2481 65.9867 74.7122 66.6488 74.7122H71.5987C72.245 74.7122 72.781 75.2481 72.781 75.8945C72.781 76.5565 72.245 77.0925 71.5987 77.0925Z"
                fill="#FAB12F"
              />
              <rect
                x="38.3522"
                y="21.5128"
                width="41.0256"
                height="2.73504"
                rx="1.36752"
                fill="#FAB12F"
              />
              <rect
                x="38.3522"
                y="133.65"
                width="54.7009"
                height="5.47009"
                rx="2.73504"
                fill="#FAB12F"
              />
              <rect
                x="38.3522"
                y="29.7179"
                width="13.6752"
                height="2.73504"
                rx="1.36752"
                fill="#FAB12F"
              />
              <circle cx="56.13" cy="31.0854" r="1.36752" fill="#FAB12F" />
              <circle cx="61.6001" cy="31.0854" r="1.36752" fill="#FAB12F" />
              <circle cx="67.0702" cy="31.0854" r="1.36752" fill="#FAB12F" />
            </svg>
            <div className="flex flex-col items-center justify-center ">
              <h2 className="text-center text-black text-xl font-semibold leading-loose pb-2">
                There's no Invoice here
              </h2>
              <p className="text-center text-black text-base font-normal leading-relaxed pb-4"></p>
              <Link href={"/create_invoice"}>
                <Button className={`bg-orange-500 w-36`}>Create Invoice</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceList;
