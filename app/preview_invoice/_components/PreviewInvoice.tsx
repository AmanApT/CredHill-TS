"use client";

import { Button } from "@/components/ui/button";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import moment from "moment";
import { getPaymentStatusInfo, formatIndianNumber } from "@/lib/invoiceUtils";

import { useParams } from "next/navigation";

import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import Link from "next/link";
import { PencilIcon, Printer, Save, Palette, Check } from "lucide-react";

// ─── Theme definitions ───────────────────────────────────────────────────────

type FontSize = "sm" | "md" | "lg";

interface InvoiceTheme {
  primary: string;
  accent: string;
  fontSize: FontSize;
}

const DEFAULT_THEME: InvoiceTheme = {
  primary: "#6538BF",
  accent: "#efebf8",
  fontSize: "md",
};

const FONT_ZOOM: Record<FontSize, number> = { sm: 0.88, md: 1, lg: 1.12 };

const PRESET_THEMES = [
  { name: "Purple",  primary: "#6538BF", accent: "#efebf8" },
  { name: "Indigo",  primary: "#4338ca", accent: "#eef2ff" },
  { name: "Blue",    primary: "#1d4ed8", accent: "#eff6ff" },
  { name: "Teal",    primary: "#0f766e", accent: "#f0fdfa" },
  { name: "Green",   primary: "#166534", accent: "#f0fdf4" },
  { name: "Rose",    primary: "#be123c", accent: "#fff1f2" },
  { name: "Orange",  primary: "#c2410c", accent: "#fff7ed" },
  { name: "Slate",   primary: "#1e3a5f", accent: "#f0f4f8" },
];

const PreviewInvoice = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [theme, setTheme] = useState<InvoiceTheme>(DEFAULT_THEME);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  const {
    invoiceFormData,
    setInvoiceFormData,
    companyDetails,
    tableRows,
    includeBankDetails,
    items,
  } = useInvoiceContext();
  const params = useParams<{
    invoiceId: string;
    tag: string;
    item: string;
  }>();

  const numberToWords = (amount: number) => {
    const singleDigits = [
      "",
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
    ];
    const twoDigits = [
      "",
      "",
      "TWENTY",
      "THIRTY",
      "FORTY",
      "FIFTY",
      "SIXTY",
      "SEVENTY",
      "EIGHTY",
      "NINETY",
    ];
    const teens = [
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ];
    // const placeValues = ["", "THOUSAND", "LAKH", "CRORE"];

    function convertToWords(num: number) {
      let words = "";

      if (num >= 1000) {
        let thousands = Math.floor(num / 1000);
        words += `${convertToWords(thousands)} THOUSAND `;
        num %= 1000;
      }
      if (num >= 100) {
        let hundreds = Math.floor(num / 100);
        words += `${singleDigits[hundreds]} HUNDRED `;
        num %= 100;
      }
      if (num > 10 && num < 20) {
        words += `${teens[num - 11]} `;
      } else if (num >= 20 || num === 10) {
        let tens = Math.floor(num / 10);
        words += `${twoDigits[tens]} `;
        num %= 10;
      }
      if (num > 0 && num <= 9) {
        words += `${singleDigits[num]} `;
      }

      return words.trim();
    }

    const integerPart = Math.floor(amount);
    let words = convertToWords(integerPart).trim();

    return words ? `${words} RUPEES ONLY` : "ZERO RUPEES ONLY";
  };
  const { user } = useKindeBrowserClient();
  const addInvoice = useMutation(api.functions.invoice.addInvoice);
  const updateInvoiceData = useMutation(api.functions.invoice.updateInvoice);
  const savePreferencesMutation = useMutation(api.functions.invoicePreferences.savePreferences);
  const savedPrefs = useQuery(
    api.functions.invoicePreferences.getPreferences,
    user?.email ? { email: user.email } : "skip"
  );

  // Load saved preferences on mount
  useEffect(() => {
    if (savedPrefs) {
      setTheme({
        primary: savedPrefs.themeColor,
        accent: savedPrefs.accentColor,
        fontSize: savedPrefs.fontSize as FontSize,
      });
    }
  }, [savedPrefs]);

  const handleSaveTheme = async () => {
    if (!user?.email) return;
    setIsSavingTheme(true);
    try {
      await savePreferencesMutation({
        email: user.email,
        themeColor: theme.primary,
        accentColor: theme.accent,
        fontSize: theme.fontSize,
      });
      toast("Theme preferences saved!");
    } catch {
      toast("Failed to save preferences");
    } finally {
      setIsSavingTheme(false);
    }
  };
  const calculateTotalSums = () => {
    return tableRows.reduce(
      (sums, row) => {
        sums.amount += row.amount;
        sums.cgst += row.cgst;
        sums.sgst += row.sgst;
        sums.igst += row.igst;
        sums.total += row.total;
        return sums;
      },
      { amount: 0, cgst: 0, sgst: 0, total: 0, igst: 0 }
    );
  };
  // console.log(companyDetails, "company");
  const getHsn = (item: string) => {
    const newItem = items.find((eachItem) => eachItem.itemName === item);
    console.log(newItem);

    // Return newItem.hsn if the item is found, otherwise return a fallback value
    return newItem ? newItem.hsn : ""; // or "" if you prefer an empty string
  };

  const { amount, cgst, sgst, total, igst } = calculateTotalSums();
  const saveInvoice = async () => {
    try {
      await addInvoice({
        invoiceNo: invoiceFormData?.invoiceNo,
        venue: invoiceFormData?.venue,
        approvalId: invoiceFormData?.approvalId,
        date: invoiceFormData?.date,
        ref: invoiceFormData?.referredBy,
        billedBy: user?.email ?? "",
        clientId: (companyDetails?.billedTo as any)?._id,
        totalAmount: total.toString(),
        tax: (cgst + sgst + igst).toString(),
        invoiceStatus: invoiceFormData?.invoiceStatus ?? false,
        item: JSON.stringify(tableRows),
      });
      setIsSaved(true);
      toast("Invoice Saved!");
      // router.push('/dashboard')
    } catch (err: any) {
      toast(`Error: ${err?.message ?? "Could not save invoice"}`, {
        style: { backgroundColor: "red", color: "white" },
      });
    }
  };
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef: contentRef as any });
  const printInvoice = () => {
    reactToPrintFn();
  };
  const updateInvoice = async () => {
    try {
      await updateInvoiceData({
        _id: params?.invoiceId as any,
        invoiceNo: invoiceFormData?.invoiceNo,
        venue: invoiceFormData?.venue,
        approvalId: invoiceFormData?.approvalId,
        date: invoiceFormData?.date,
        ref: invoiceFormData?.referredBy,
        billedBy: user?.email ?? "",
        clientId: (companyDetails?.billedTo as any)?._id,
        totalAmount: total.toString(),
        tax: (cgst + sgst + igst).toString(),
        invoiceStatus: invoiceFormData?.invoiceStatus ?? false,
        item: JSON.stringify(tableRows),
      });

      toast("Invoice Updated!");
      // router.push('/dashboard')
    } catch (err: any) {
      toast(`Error: ${err?.message ?? "Could not update invoice"}`, {
        style: { backgroundColor: "red", color: "white" },
      });
    }
  };

  // ─── Theme-aware style helpers ───────────────────────────────────────────
  const s = {
    primary: { backgroundColor: theme.primary, color: "#fff" } as React.CSSProperties,
    primaryText: { color: theme.primary } as React.CSSProperties,
    accent: { backgroundColor: theme.accent } as React.CSSProperties,
  };

  return (
    <>
      {/* ── Invoice content ───────────────────────────────────────────────── */}
      <section ref={contentRef} className="relative p-4 bg-white rounded-md" style={{ zoom: FONT_ZOOM[theme.fontSize] }}>

      {/* ── Theme Card — top-right inside invoice card, never prints ──────── */}
      <div className="no-print absolute top-4 right-4">
        <div className="relative">
          {/* Toggle button */}
          <button
            onClick={() => setShowThemePanel((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl shadow text-sm font-medium text-white transition-all"
            style={{ backgroundColor: theme.primary }}
            title="Customize Theme"
          >
            <Palette className="h-4 w-4" />
            {showThemePanel ? "Close" : "Theme"}
          </button>

        {showThemePanel && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-xl p-4 flex flex-col gap-4 z-50">

            {/* Header */}
            <p className="text-sm font-semibold text-gray-800">Customize Invoice</p>

            {/* Color presets */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_THEMES.map((t) => (
                  <button
                    key={t.name}
                    title={t.name}
                    onClick={() => setTheme((prev) => ({ ...prev, primary: t.primary, accent: t.accent }))}
                    className="relative h-7 w-7 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: t.primary,
                      borderColor: theme.primary === t.primary ? "#000" : "transparent",
                    }}
                  >
                    {theme.primary === t.primary && (
                      <Check className="h-3.5 w-3.5 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}

                {/* Custom color picker */}
                <label
                  title="Pick custom color"
                  className="relative h-7 w-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-500 overflow-hidden"
                >
                  <span className="text-[10px] text-gray-400 select-none">+</span>
                  <input
                    type="color"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    value={theme.primary}
                    onChange={(e) => {
                      const hex = e.target.value;
                      setTheme((prev) => ({ ...prev, primary: hex, accent: hex + "22" }));
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Font size */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Font Size</p>
              <div className="flex gap-1">
                {(["sm", "md", "lg"] as FontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setTheme((prev) => ({ ...prev, fontSize: size }))}
                    className="flex-1 py-1 rounded-lg text-xs font-medium border transition"
                    style={
                      theme.fontSize === size
                        ? { backgroundColor: theme.primary, color: "#fff", borderColor: "transparent" }
                        : { backgroundColor: "#fff", color: "#4b5563", borderColor: "#e5e7eb" }
                    }
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview swatch */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Preview</p>
              <div className="flex gap-2">
                <div className="h-6 flex-1 rounded" style={{ backgroundColor: theme.primary }} />
                <div className="h-6 flex-1 rounded border border-gray-100" style={{ backgroundColor: theme.accent }} />
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSaveTheme}
              disabled={isSavingTheme}
              className="w-full py-2 rounded-lg text-xs font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: theme.primary }}
            >
              {isSavingTheme ? "Saving…" : "Save Preferences"}
            </button>
          </div>
        )}
        </div>
      </div>

      <h2 className="text-2xl" style={s.primaryText}>Invoice</h2>
      <div className="mt-4 flex gap-5 text-sm">
        <div className="text-gray-600 font-semibold  flex flex-col gap-1">
          <p>Invoice No #</p>
          <p>Invoice Date</p>
          {invoiceFormData?.venue && <p>Venue</p>}
          {invoiceFormData?.approvalId && <p>Approval ID</p>}
          {invoiceFormData?.referredBy && <p>Order Reffered By</p>}
        </div>
        <div className="flex flex-col font-semibold gap-1">
          <div>
            <p>{invoiceFormData?.invoiceNo}</p>
          </div>
          <p>
            {moment(invoiceFormData?.date).format("DD/MM/YYYY")}
            {/* {invoiceFormData?.date} */}
          </p>
          {invoiceFormData?.venue && <p>{invoiceFormData?.venue}</p>}
          {invoiceFormData?.approvalId && <p>{invoiceFormData?.approvalId}</p>}
          {invoiceFormData?.referredBy && <p>{invoiceFormData?.referredBy}</p>}
        </div>
      </div>

      {/* Payment Status Section */}
      <div className="flex items-center gap-4 my-4 p-3 bg-slate-50 rounded-md no-print">
        <span className="font-semibold text-gray-700">Payment Status:</span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            invoiceFormData?.invoiceStatus
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {invoiceFormData?.invoiceStatus ? "✓ Payment Received" : "⏳ Pending"}
        </span>
        <Button
          onClick={() =>
            setInvoiceFormData((prev) => ({
              ...prev,
              invoiceStatus: !prev.invoiceStatus,
            }))
          }
          variant="outline"
          size="sm"
          className="no-print"
        >
          {invoiceFormData?.invoiceStatus
            ? "Mark as Incomplete"
            : "Mark as Completed"}
        </Button>
      </div>

      <section className="flex gap-4 mt-3 justify-between">
        <div className="flex w-[45vw] text-xs flex-col rounded-md p-3" style={s.accent}>
          <p className="text-base font-semibold" style={s.primaryText}>Billed By</p>
          <p className="font-bold">
            {companyDetails?.billedBy.companyName?.toUpperCase()}
          </p>
          {companyDetails?.billedBy.add && (
            <p>{companyDetails?.billedBy.add}</p>
          )}

          <p>
            {companyDetails?.billedBy.city} {companyDetails?.billedBy.pincode}
          </p>
          {companyDetails?.billedBy.gst && (
            <div>
              <span className="font-bold">GSTIN:</span>
              <span>{companyDetails?.billedBy.gst}</span>
            </div>
          )}
          {companyDetails?.billedBy.email && (
            <div>
              <span className="font-bold">Email:</span>
              <span>{companyDetails?.billedBy.email}</span>
            </div>
          )}
          {companyDetails?.billedBy.contact && (
            <div>
              <span className="font-bold">Phone:</span>
              <span>{companyDetails?.billedBy.contact}</span>
            </div>
          )}
        </div>
        <div className="flex w-[45vw] text-xs flex-col rounded-md p-3" style={s.accent}>
          <p className="text-base font-semibold" style={s.primaryText}>Billed To</p>
          <p className="font-bold">
            {companyDetails?.billedTo.clientName?.toUpperCase()}
          </p>
          {companyDetails?.billedTo.add && (
            <p>{companyDetails?.billedTo.add}</p>
          )}

          <p>
            {companyDetails?.billedTo.city} {companyDetails?.billedTo.pincode}
          </p>
          {companyDetails?.billedTo.gst && (
            <div>
              <span className="font-bold">GSTIN: </span>
              <span>{companyDetails?.billedTo.gst} </span>
            </div>
          )}
          {companyDetails?.billedTo.email && (
            <div>
              <span className="font-bold">Email: </span>
              <span>{companyDetails?.billedTo.email} </span>
            </div>
          )}
          {companyDetails?.billedTo.contact && (
            <div>
              <span className="font-bold">Phone: </span>
              <span>{companyDetails?.billedTo.contact} </span>
            </div>
          )}
        </div>
      </section>

      <section>
        <table className="w-full mt-6  ">
          <thead style={s.primary}>
            <tr className="text-xs">
              <th className="rounded-tl-md "></th>
              <th id="itemCol" className="text-left p-2 w-[9rem] ">
                Item
              </th>
              <th className="w-[3rem]">GST Rate</th>
              <th>Date</th>
              <th className="">Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
              {companyDetails?.billedTo?.gst?.substring(0, 2) == "07" ? (
                <>
                  <th>CGST</th>
                  <th>SGST</th>
                </>
              ) : (
                <th>IGST</th>
              )}

              <th className="rounded-tr-md">Total</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, idx) => (
              <tr
                className="text-center text-xs"
                style={idx % 2 === 0 ? s.accent : { backgroundColor: "#fff" }}
                key={idx}
              >
                <td className="  p-2 py-3">{idx + 1}</td>
                <td className="text-left">
                  <p>{row.item}</p>
                  <p className="text-[0.5rem]">HSN/SAC: {getHsn(row.item)}</p>
                </td>
                <td>{row.gstRate}</td>
                <td>
                  {moment(row.date).format("DD/MM/YYYY")}
                  {/* {row.date} */}
                </td>
                <td className="break-words  whitespace-normal">
                  {row.description}
                </td>
                <td className="">{row.quantity}</td>
                <td>{formatIndianNumber(row.rate)}</td>
                <td>{formatIndianNumber(row.amount)}</td>
                {companyDetails?.billedTo?.gst?.substring(0, 2) == "07" ? (
                  <>
                    {" "}
                    <td className="">{formatIndianNumber(row.cgst)}</td>
                    <td className="">{formatIndianNumber(row.sgst)}</td>
                  </>
                ) : (
                  <td>{formatIndianNumber(row.igst)}</td>
                )}

                <td>{formatIndianNumber(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="flex justify-between h-60 ">
          <div className="w-1/2  avoid-break">
            <div className="mt-4 font-semibold ">
              Total (in words): {numberToWords(total)}
            </div>
            {includeBankDetails && (
              <div className="mt-4 rounded-md p-2" style={s.accent}>
                <p className="my-2 font-semibold" style={s.primaryText}>Bank Details</p>
                <div className="flex justify-between">
                  <div className="font-semibold flex flex-col gap-1">
                    <p>Account Name</p>
                    <p>Account Number</p>
                    <p>IFSC</p>
                    {/* <p>Account Type</p> */}
                    <p>Bank</p>
                  </div>
                  <div className="flex flex-col gap-1 ">
                    <p>{companyDetails?.billedBy?.companyName}</p>
                    <p>{companyDetails?.accountInfo?.accountNo}</p>
                    <p>{companyDetails?.accountInfo?.ifsc}</p>

                    {/* <p>Current</p> */}
                    <p>{companyDetails?.accountInfo?.bankName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="w-1/3 text-sm pr-4">
            <div className="mt-4 flex justify-between ">
              <div className=" flex flex-col gap-2">
                <p>Amount</p>
                {companyDetails?.billedTo?.gst?.substring(0, 2) === "07" ? (
                  <>
                    <p>CGST</p>
                    <p>SGST</p>
                  </>
                ) : (
                  <p>IGST</p>
                )}
              </div>
              <div className="flex flex-col gap-2 text-right">
                <p>₹{formatIndianNumber(amount, true)}</p>
                {companyDetails?.billedTo?.gst?.substring(0, 2) === "07" ? (
                  <>
                    <p>₹{formatIndianNumber(cgst, true)} </p>
                    <p>₹{formatIndianNumber(sgst, true)}</p>
                  </>
                ) : (
                  <p>₹ {formatIndianNumber(igst, true)}</p>
                )}
              </div>
            </div>
            <hr className="mt-4 border border-black" />
            <div className="py-1 flex text-base justify-between font-bold">
              <span>Total (INR)</span>
              <span>₹ {formatIndianNumber(total, true)}</span>
            </div>
            <hr className="border border-black" />
            <div>
              {" "}
              {companyDetails?.billedBy?.stampUrl && (
                <div className=" avoid-break ">
                  <Image
                    className=""
                    width={120}
                    height={120}
                    alt="Company Stamp"
                    src={companyDetails?.billedBy?.stampUrl}
                  ></Image>
                </div>
              )}
            </div>
          </div>
        </section>
      </section>

      <div className="flex justify-between avoid-break">
        <div className="gap-5 flex mt-5">
          <Link
            href={
              params?.invoiceId
                ? `/create_invoice/${params.invoiceId}`
                : "/create_invoice"
            }
            className="no-print"
          >
            <Button>
              <PencilIcon />
              Edit
            </Button>
          </Link>
          <Button onClick={printInvoice} className="no-print">
            <Printer />
            Print
          </Button>
          {params?.invoiceId === undefined ? (
            <Button
              onClick={saveInvoice}
              disabled={isSaved}
              className="no-print bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save />
              {isSaved ? "Invoice Saved" : "Save Invoice"}
            </Button>
          ) : (
            <Button onClick={updateInvoice} className="no-print">
              Update Invoice
            </Button>
          )}
        </div>
      </div>
    </section>
    </>
  );
};

export default PreviewInvoice;
