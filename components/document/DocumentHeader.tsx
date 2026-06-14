"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { DOC_META, DocType } from "@/lib/documentConfig";

/** Page header shared by the quotation/proforma create, edit and list routes. */
export function DocumentHeader({
  docType,
  variant = "form",
}: {
  docType: DocType;
  variant?: "form" | "list";
}) {
  const params = useParams();
  const { invoiceFormData } = useInvoiceContext();
  const meta = DOC_META[docType];
  const isEdit = !!(params?.quotationId || params?.proformaId || params?.invoiceId);

  const title =
    variant === "list"
      ? `Manage ${meta.docLabel}s`
      : isEdit
      ? `Edit ${meta.docLabel}: ${invoiceFormData?.invoiceNo || "Loading..."}`
      : `Create New ${meta.docLabel}`;

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="px-4 py-2">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-gray-700 transition hover:bg-gray-50 focus:outline-none">
                <span className="label-text">Go to Dashboard</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </Link>
            <Link href="/profile">
              <div className="inline-block rounded-lg bg-orange-500 px-4 py-1.5 label-text text-white transition hover:bg-slate-700 focus:outline-none">
                Profile
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
