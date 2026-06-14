"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { toast } from "sonner";
import { Calendar, Users, ChevronDown } from "lucide-react";
import {
  getDateRange,
  filterInvoicesByDateRange,
  filterInvoicesByClients,
  FilterType,
  DateRange,
} from "@/lib/dateUtils";
import { formatIndianNumber } from "@/lib/invoiceUtils";
import { DateRangeFilter } from "@/app/dashboard/_components/DateRangeFilter";
import { DOC_META, manualStatuses } from "@/lib/documentConfig";
import { DOC_CONVEX } from "@/lib/documentConvex";
import { getDocStatusInfo } from "@/lib/statusBadge";
import { DeleteDocumentDialog } from "./DeleteDocumentDialog";
import { ConvertDocumentDialog } from "./ConvertDocumentDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type NewDocType = "quotation" | "proforma";

const DocumentList = ({ docType }: { docType: NewDocType }) => {
  const rowsPerPage = 10;
  const meta = DOC_META[docType];
  const noField = meta.numberField;
  const { setQuotations, setProformas } = useInvoiceContext();
  const { user } = useKindeBrowserClient();
  const convex = useConvex();
  const updateStatus = useMutation(DOC_CONVEX[docType].updateStatus as any);

  const data = useQuery(
    DOC_CONVEX[docType].list as any,
    user?.email ? { email: user.email } : "skip"
  ) as any[] | undefined;

  // Keep context arrays in sync for the dashboard.
  useEffect(() => {
    if (!data) return;
    if (docType === "quotation") setQuotations(data);
    else setProformas(data);
  }, [data, docType, setQuotations, setProformas]);

  const allDocs = data ?? [];

  const [localDocs, setLocalDocs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [customStartDate, setCustomStartDate] = useState<string>();
  const [customEndDate, setCustomEndDate] = useState<string>();
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange("all"));
  const [showDateFilter, setShowDateFilter] = useState(false);

  const [allClients, setAllClients] = useState<{ _id: string; clientName: string }[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [showClientFilter, setShowClientFilter] = useState(false);

  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(rowsPerPage);

  useEffect(() => {
    if (user?.email) {
      convex
        .query(api.functions.clients.getClients, { email: user.email })
        .then((clients) =>
          setAllClients(clients as unknown as { _id: string; clientName: string }[])
        );
    }
  }, [convex, user?.email]);

  const handleFilterChange = (filterType: FilterType, customStart?: string, customEnd?: string) => {
    setSelectedFilter(filterType);
    if (filterType === "custom" && customStart && customEnd) {
      setCustomStartDate(customStart);
      setCustomEndDate(customEnd);
      setDateRange({ startDate: new Date(customStart), endDate: new Date(customEnd) });
    } else {
      setDateRange(getDateRange(filterType));
    }
  };

  useEffect(() => {
    let filtered = allDocs;
    if (selectedFilter !== "all") filtered = filterInvoicesByDateRange(filtered, dateRange);
    filtered = filterInvoicesByClients(filtered, selectedClientIds);
    if (searchTerm !== "") {
      filtered = filtered.filter((d) => d?.[noField]?.toLowerCase().includes(searchTerm));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d?.status === statusFilter);
    }
    setLocalDocs(filtered);
    setStartIndex(0);
    setEndIndex(rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchTerm, statusFilter, dateRange, selectedFilter, selectedClientIds]);

  const visibleDocs = localDocs?.slice(startIndex, endIndex) || [];

  const handleStatusChange = async (id: string, status: string) => {
    if (!user?.email) return;
    try {
      await updateStatus({ _id: id as any, status, billedBy: user.email });
    } catch (err: any) {
      toast(err?.message ?? "Could not update status", {
        style: { backgroundColor: "red", color: "white" },
      });
    }
  };

  return (
    <div className="relative overflow-x-auto rounded-xl border border-gray-100 shadow-sm p-5 bg-white">
      <div className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Status filter */}
          <div className="flex gap-2 items-center">
            <span className="label-text text-gray-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="all">All</option>
              {meta.statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDateFilter(!showDateFilter);
                setShowClientFilter(false);
              }}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              {showDateFilter ? "Hide" : "Date Filter"}
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowClientFilter(!showClientFilter);
                  setShowDateFilter(false);
                }}
                className={`gap-2 ${
                  selectedClientIds.length > 0
                    ? "border-orange-400 text-orange-600 bg-orange-50"
                    : ""
                }`}
              >
                <Users className="h-4 w-4" />
                {selectedClientIds.length === 0
                  ? "Clients"
                  : selectedClientIds.length === allClients.length
                  ? "All Clients"
                  : `${selectedClientIds.length} Client${selectedClientIds.length > 1 ? "s" : ""}`}
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${showClientFilter ? "rotate-180" : ""}`}
                />
              </Button>

              {showClientFilter && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowClientFilter(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                    <button
                      onClick={() =>
                        setSelectedClientIds(
                          selectedClientIds.length === allClients.length
                            ? []
                            : allClients.map((c) => c._id)
                        )
                      }
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-100"
                    >
                      <span className="font-medium text-gray-700">
                        {selectedClientIds.length === allClients.length
                          ? "Deselect all"
                          : "Select all"}
                      </span>
                    </button>
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
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            <span
                              className={`flex items-center justify-center w-4 h-4 rounded border flex-shrink-0 ${
                                isSelected
                                  ? "bg-orange-500 border-orange-500 text-white"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            <span
                              className={`text-left ${
                                isSelected ? "text-gray-900 font-medium" : "text-gray-600"
                              }`}
                            >
                              {client.clientName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

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

        <div className="relative mt-1">
          <Input
            type="text"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="block w-80 bg-gray-50"
            placeholder={`Search ${meta.docLabel} number`}
          />
        </div>
      </div>

      <table className="w-full text-left text-gray-600">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">{meta.numberLabel}</th>
            <th className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">Date</th>
            <th className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">Total Amount</th>
            <th className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">Taxes</th>
            <th className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 table-header text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        {allDocs.length !== 0 && (
          <tbody>
            {visibleDocs.map((doc: any) => {
              const info = getDocStatusInfo(docType, doc.status);
              const isConverted = doc.status === "converted";
              return (
                <tr key={doc?._id} className="border-b border-gray-50 bg-white hover:bg-gray-50">
                  <td className="px-4 py-3.5 table-content font-medium text-gray-900 whitespace-nowrap">
                    {doc?.[noField]}
                  </td>
                  <td className="px-4 py-3.5 table-content text-gray-600">
                    {moment(doc?.date).format("DD MMM YYYY")}
                  </td>
                  <td className="px-4 py-3.5 table-content text-gray-900 font-medium">
                    ₹{formatIndianNumber(doc?.totalAmount)}
                  </td>
                  <td className="px-4 py-3.5 table-content text-gray-600">
                    ₹{formatIndianNumber(doc?.tax)}
                  </td>
                  <td className="px-4 py-3.5">
                    {isConverted ? (
                      <span
                        className={`px-2.5 py-1 rounded-full small-text font-medium ${info.bgClass} ${info.textClass}`}
                      >
                        {info.label}
                      </span>
                    ) : (
                      <select
                        value={doc.status}
                        onChange={(e) => handleStatusChange(doc._id, e.target.value)}
                        className={`text-xs rounded-full px-2.5 py-1 font-medium border-0 ${info.bgClass} ${info.textClass}`}
                      >
                        {manualStatuses(docType).map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={meta.routes.edit(doc?._id)}>
                        <Button size="sm" className="h-8 px-3 label-text">
                          Edit/View
                        </Button>
                      </Link>
                      {!isConverted &&
                        meta.conversions.map((c) => (
                          <ConvertDocumentDialog
                            key={c.to}
                            sourceId={doc._id}
                            from={docType}
                            to={c.to}
                            label={c.label}
                            trigger={
                              <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                                → {c.to === "invoice" ? "Invoice" : "Proforma"}
                              </Button>
                            }
                          />
                        ))}
                      <DeleteDocumentDialog docType={docType} id={doc?._id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </table>

      {allDocs.length !== 0 ? (
        <div className="flex justify-center">
          <Pagination className="m-2 w-[95%] cursor-pointer">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={startIndex === 0 ? "pointer-events-none opacity-50" : undefined}
                  onClick={() => {
                    setStartIndex(startIndex - rowsPerPage);
                    setEndIndex(endIndex - rowsPerPage);
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className={
                    endIndex >= (localDocs?.length || 0)
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
      ) : (
        <div className="flex flex-col p-8 items-center justify-center">
          <h2 className="text-center text-black text-xl font-semibold leading-loose pb-2">
            There's no {meta.docLabel} here
          </h2>
          <Link href={meta.routes.create}>
            <Button className="bg-orange-500 w-44">Create {meta.docLabel}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
