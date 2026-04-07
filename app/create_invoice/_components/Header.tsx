'use client'
import Link from "next/link";
import { useParams } from 'next/navigation';
import React from "react";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";

const Header = () => {
  const params = useParams();
  const { invoiceFormData } = useInvoiceContext();

  const isEditMode = params?.invoiceId !== undefined;
  const headerTitle = isEditMode
    ? `Preview Invoice: ${invoiceFormData?.invoiceNo || "Loading..."}`
    : "Create New Invoice";

  return (
    <header className="bg-white">
      <div className=" px-4 py-2">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm">
              {headerTitle}
            </h1>
          </div>

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
};

export default Header;
