"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useConvex, useMutation, useQuery } from "convex/react";
import Image from "next/image";
import moment from "moment";
import { formatIndianNumber } from "@/lib/invoiceUtils";
import { parseConfig } from "@/lib/invoiceConfig";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import Link from "next/link";
import { PencilIcon, Printer, Save, Palette, Check } from "lucide-react";
import {
  DEFAULT_THEME,
  FONT_ZOOM,
  PRESET_THEMES,
  type FontSize,
  type InvoiceTheme,
} from "@/lib/theme";
import { numberToWords } from "@/lib/numberToWords";
import { getGstMode, isGstColumnVisibleForMode } from "@/lib/gstUtils";
import { calculateTotalSums } from "@/lib/documentTotals";
import { getDocStatusInfo } from "@/lib/statusBadge";
import { DOC_META } from "@/lib/documentConfig";
import { DOC_CONVEX } from "@/lib/documentConvex";
import { ConvertDocumentDialog } from "./ConvertDocumentDialog";

type NewDocType = "quotation" | "proforma";

const DocumentPreview = ({ docType }: { docType: NewDocType }) => {
  const meta = DOC_META[docType];
  const {
    invoiceFormData,
    companyDetails,
    tableRows,
    includeBankDetails,
    items,
    setItems,
    extraFields,
  } = useInvoiceContext();

  const params = useParams<{ quotationId: string; proformaId: string }>();
  const docId = docType === "quotation" ? params?.quotationId : params?.proformaId;
  const isEdit = docId !== undefined;
  const router = useRouter();
  const convex = useConvex();
  const { user } = useKindeBrowserClient();

  const [isSaved, setIsSaved] = useState(false);
  const [savedDocId, setSavedDocId] = useState<string | undefined>(docId);
  const [theme, setTheme] = useState<InvoiceTheme>(DEFAULT_THEME);
  const [themeReady, setThemeReady] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  const addDoc = useMutation(DOC_CONVEX[docType].add as any);
  const updateDoc = useMutation(DOC_CONVEX[docType].update as any);
  const savePreferencesMutation = useMutation(
    api.functions.invoicePreferences.savePreferences
  );

  const savedConfig = useQuery(
    api.functions.invoiceConfig.getConfig,
    user?.email ? { email: user.email } : "skip"
  );
  const config = parseConfig(savedConfig);
  const savedPrefs = useQuery(
    api.functions.invoicePreferences.getPreferences,
    user?.email ? { email: user.email } : "skip"
  );

  // Current saved doc (edit mode) — for status display + conversion guards.
  const docs = useQuery(
    DOC_CONVEX[docType].list as any,
    user?.email && isEdit ? { email: user.email } : "skip"
  ) as any[] | undefined;
  const currentDoc = isEdit ? docs?.find((d) => d?._id === docId) : undefined;
  const status = currentDoc?.status ?? "draft";

  // Apply saved theme on first paint (flip themeReady in the same pass — see
  // the invoice preview for why gating on the query alone flashes the default).
  useEffect(() => {
    if (savedPrefs === undefined) return;
    if (savedPrefs) {
      setTheme({
        primary: savedPrefs.themeColor,
        accent: savedPrefs.accentColor,
        fontSize: savedPrefs.fontSize as FontSize,
      });
    }
    setThemeReady(true);
  }, [savedPrefs]);

  useEffect(() => {
    if (user?.email && items.length === 0) {
      convex.query(api.functions.items.getItems, { email: user.email }).then(setItems);
    }
  }, [user]);

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

  const getHsn = (item: string) => {
    const found = items.find((i) => i.itemName === item);
    return found ? found.hsn : "";
  };

  const { amount, cgst, sgst, total, igst } = calculateTotalSums(tableRows);
  const gstMode = getGstMode(
    companyDetails?.billedBy?.gstin || companyDetails?.billedBy?.gst,
    companyDetails?.billedTo?.gst
  );

  const buildPayload = () => {
    const payload: any = {
      [meta.numberField]: invoiceFormData?.invoiceNo,
      venue: invoiceFormData?.venue,
      approvalId: invoiceFormData?.approvalId,
      date: invoiceFormData?.date,
      ref: invoiceFormData?.referredBy,
      billedBy: user?.email ?? "",
      clientId: (companyDetails?.billedTo as any)?._id,
      totalAmount: total.toString(),
      tax: (cgst + sgst + igst).toString(),
      item: JSON.stringify(tableRows),
      extraFields: Object.keys(extraFields).length
        ? JSON.stringify(extraFields)
        : undefined,
    };
    if (meta.showValidity && invoiceFormData?.validUntil) {
      payload.validUntil = invoiceFormData.validUntil;
    }
    return payload;
  };

  const saveDocument = async () => {
    try {
      const id = await addDoc(buildPayload());
      setIsSaved(true);
      setSavedDocId(id as unknown as string);
      toast(`${meta.docLabel} saved!`);
    } catch (err: any) {
      toast(`Error: ${err?.message ?? "Could not save"}`, {
        style: { backgroundColor: "red", color: "white" },
      });
    }
  };

  const updateDocument = async () => {
    try {
      await updateDoc({ _id: docId as any, ...buildPayload() });
      toast(`${meta.docLabel} updated!`);
    } catch (err: any) {
      toast(`Error: ${err?.message ?? "Could not update"}`, {
        style: { backgroundColor: "red", color: "white" },
      });
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef: contentRef as any });

  const s = {
    primary: { backgroundColor: theme.primary, color: "#fff" } as React.CSSProperties,
    primaryText: { color: theme.primary } as React.CSSProperties,
    accent: { backgroundColor: theme.accent } as React.CSSProperties,
  };

  const statusInfo = getDocStatusInfo(docType, status);

  // Hold render until theme + config resolve, then fade in (no default flash).
  const ready = themeReady && savedConfig !== undefined;
  if (!ready) {
    return (
      <section className="p-4 bg-white rounded-md animate-in fade-in-0 duration-300">
        <Skeleton className="h-8 w-40" />
        <div className="mt-5 flex gap-10">
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="mt-8 flex justify-between gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex w-[45vw] flex-col gap-2.5 rounded-md bg-gray-50 p-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-44" />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Skeleton className="h-10 w-full" />
          <div className="mt-2.5 space-y-2.5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        ref={contentRef}
        className="relative p-4 bg-white rounded-md animate-in fade-in-0 duration-300"
        style={{ zoom: FONT_ZOOM[theme.fontSize] }}
      >
        {/* Theme customizer — never prints */}
        <div className="no-print absolute top-4 right-4">
          <div className="relative">
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
                <p className="text-sm font-semibold text-gray-800">Customize Document</p>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Color
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_THEMES.map((t) => (
                      <button
                        key={t.name}
                        title={t.name}
                        onClick={() =>
                          setTheme((prev) => ({ ...prev, primary: t.primary, accent: t.accent }))
                        }
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

                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Font Size
                  </p>
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

        <h2 className="text-2xl font-bold" style={s.primaryText}>
          {meta.previewTitle}
        </h2>
        {meta.notTaxInvoiceNote && (
          <p className="text-xs italic text-gray-500 mt-1">{meta.notTaxInvoiceNote}</p>
        )}

        <div className="mt-4 flex gap-5 text-sm">
          <div className="text-gray-600 font-semibold flex flex-col gap-1">
            <p>{meta.numberLabel}</p>
            <p>Date</p>
            {meta.showValidity && invoiceFormData?.validUntil && <p>Valid Until</p>}
            {config.headerFields
              .filter((f) => {
                if (!f.visible) return false;
                if (f.key === "invoiceNo" || f.key === "date") return false;
                const formKey = f.key === "ref" ? "referredBy" : f.key;
                return !!(invoiceFormData as any)?.[formKey];
              })
              .map((f) => (
                <p key={f.key}>{f.label}</p>
              ))}
            {config.customHeaderFields
              .filter((f) => !!extraFields?.[f.key])
              .map((f) => (
                <p key={f.key}>{f.label}</p>
              ))}
          </div>
          <div className="flex flex-col font-semibold gap-1">
            <p>{invoiceFormData?.invoiceNo}</p>
            <p>{moment(invoiceFormData?.date).format("DD/MM/YYYY")}</p>
            {meta.showValidity && invoiceFormData?.validUntil && (
              <p>{moment(invoiceFormData.validUntil).format("DD/MM/YYYY")}</p>
            )}
            {config.headerFields
              .filter((f) => {
                if (!f.visible) return false;
                if (f.key === "invoiceNo" || f.key === "date") return false;
                const formKey = f.key === "ref" ? "referredBy" : f.key;
                return !!(invoiceFormData as any)?.[formKey];
              })
              .map((f) => {
                const formKey = f.key === "ref" ? "referredBy" : f.key;
                return <p key={f.key}>{(invoiceFormData as any)?.[formKey]}</p>;
              })}
            {config.customHeaderFields
              .filter((f) => !!extraFields?.[f.key])
              .map((f) => {
                const val = extraFields[f.key];
                return (
                  <p key={f.key}>
                    {f.type === "date" && val ? moment(val).format("DD/MM/YYYY") : val}
                  </p>
                );
              })}
          </div>
        </div>

        {/* Status (never prints) */}
        <div className="flex items-center gap-3 my-4 p-3 bg-slate-50 rounded-md no-print">
          <span className="font-semibold text-gray-700">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`}
          >
            {statusInfo.label}
          </span>
          {!isEdit && !isSaved && (
            <span className="text-xs text-gray-400">Save to enable conversion & tracking</span>
          )}
        </div>

        <section className="flex gap-4 mt-3 justify-between">
          <div className="flex w-[45vw] text-xs flex-col rounded-md p-3" style={s.accent}>
            <p className="text-base font-semibold" style={s.primaryText}>
              Billed By
            </p>
            <p className="font-bold">{companyDetails?.billedBy.companyName?.toUpperCase()}</p>
            {companyDetails?.billedBy.add && <p>{companyDetails?.billedBy.add}</p>}
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
            <p className="text-base font-semibold" style={s.primaryText}>
              Billed To
            </p>
            <p className="font-bold">{companyDetails?.billedTo.clientName?.toUpperCase()}</p>
            {companyDetails?.billedTo.add && <p>{companyDetails?.billedTo.add}</p>}
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
          <table className="w-full mt-6">
            <thead style={s.primary}>
              <tr className="text-xs">
                <th className="rounded-tl-md"></th>
                {(() => {
                  const visibleCols = config.tableColumns.filter((col) => {
                    if (!col.visible) return false;
                    if (col.key === "hsn") return false;
                    return isGstColumnVisibleForMode(col.key, gstMode);
                  });
                  return visibleCols.map((col, idx) => (
                    <th
                      key={col.key}
                      className={`${col.key === "item" ? "text-left p-2 w-[9rem]" : ""} ${
                        idx === visibleCols.length - 1 ? "rounded-tr-md" : ""
                      }`}
                    >
                      {col.label}
                    </th>
                  ));
                })()}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, idx) => {
                const visibleCols = config.tableColumns.filter((col) => {
                  if (!col.visible) return false;
                  if (col.key === "hsn") return false;
                  return isGstColumnVisibleForMode(col.key, gstMode);
                });
                const hsnVisible = config.tableColumns.find((c) => c.key === "hsn")?.visible;
                return (
                  <tr
                    className="text-center text-xs"
                    style={idx % 2 === 0 ? s.accent : { backgroundColor: "#fff" }}
                    key={idx}
                  >
                    <td className="p-2 py-3">{idx + 1}</td>
                    {visibleCols.map((col) => {
                      if (col.key === "item") {
                        return (
                          <td key={col.key} className="text-left">
                            <p>{row.item}</p>
                            {hsnVisible && (
                              <p className="text-[0.5rem]">HSN/SAC: {getHsn(row.item)}</p>
                            )}
                          </td>
                        );
                      }
                      if (col.key === "gstRate") return <td key={col.key}>{row.gstRate}</td>;
                      if (col.key === "date")
                        return <td key={col.key}>{moment(row.date).format("DD/MM/YYYY")}</td>;
                      if (col.key === "description")
                        return (
                          <td key={col.key} className="break-words whitespace-normal">
                            {row.description}
                          </td>
                        );
                      if (col.key === "quantity") return <td key={col.key}>{row.quantity}</td>;
                      if (col.key === "rate") return <td key={col.key}>{formatIndianNumber(row.rate)}</td>;
                      if (col.key === "amount") return <td key={col.key}>{formatIndianNumber(row.amount)}</td>;
                      if (col.key === "cgst") return <td key={col.key}>{formatIndianNumber(row.cgst)}</td>;
                      if (col.key === "sgst") return <td key={col.key}>{formatIndianNumber(row.sgst)}</td>;
                      if (col.key === "igst") return <td key={col.key}>{formatIndianNumber(row.igst)}</td>;
                      if (col.key === "total") return <td key={col.key}>{formatIndianNumber(row.total)}</td>;
                      return <td key={col.key}>—</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <section className="flex justify-between">
            <div className="w-1/2 avoid-break">
              <div className="mt-4 font-semibold">Total (in words): {numberToWords(total)}</div>
              {includeBankDetails && (
                <div className="mt-4 rounded-md p-2" style={s.accent}>
                  <p className="my-2 font-semibold" style={s.primaryText}>
                    Bank Details
                  </p>
                  <div className="flex justify-between">
                    <div className="font-semibold flex flex-col gap-1">
                      <p>Account Name</p>
                      <p>Account Number</p>
                      <p>IFSC</p>
                      <p>Bank</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p>{companyDetails?.billedBy?.companyName}</p>
                      <p>{companyDetails?.accountInfo?.accountNo}</p>
                      <p>{companyDetails?.accountInfo?.ifsc}</p>
                      <p>{companyDetails?.accountInfo?.bankName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-1/3 text-sm pr-4">
              <div className="mt-4 flex justify-between">
                <div className="flex flex-col gap-2">
                  <p>Amount</p>
                  {gstMode === "intra" ? (
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
                  {gstMode === "intra" ? (
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
                {companyDetails?.billedBy?.stampUrl && (
                  <div className="avoid-break">
                    <Image
                      width={120}
                      height={120}
                      alt="Company Stamp"
                      src={companyDetails?.billedBy?.stampUrl}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        </section>
      </section>

      {/* Action bar — never prints */}
      <div className="flex justify-between avoid-break no-print">
        <div className="gap-3 flex mt-5 flex-wrap">
          <Link href={isEdit ? meta.routes.edit(docId!) : meta.routes.create}>
            <Button>
              <PencilIcon />
              Edit
            </Button>
          </Link>
          <Button onClick={() => reactToPrintFn()}>
            <Printer />
            Print
          </Button>
          {!isEdit ? (
            <Button
              onClick={saveDocument}
              disabled={isSaved}
              className="bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save />
              {isSaved ? `${meta.docLabel} Saved` : `Save ${meta.docLabel}`}
            </Button>
          ) : (
            <Button onClick={updateDocument}>Update {meta.docLabel}</Button>
          )}

          {/* Conversions — available once the doc is saved and not yet converted */}
          {savedDocId &&
            status !== "converted" &&
            meta.conversions.map((c) => (
              <ConvertDocumentDialog
                key={c.to}
                sourceId={savedDocId}
                from={docType}
                to={c.to}
                label={c.label}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default DocumentPreview;
