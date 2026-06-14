import React from "react";
import DocumentForm from "@/components/document/DocumentForm";
import { DocumentHeader } from "@/components/document/DocumentHeader";

const Page = () => {
  return (
    <div>
      <DocumentHeader docType="quotation" />
      <div className="p-4 md:px-2 bg-gray-100">
        <div className="flex gap-4 items-center justify-center">
          <span className="rounded-full w-6 h-6 text-xs flex items-center justify-center text-white bg-purple-700">1</span>
          <span className="text-gray-900">Quotation Details</span>
          <span className="text-gray-600"> {">"}</span>
          <span className="rounded-full text-gray-600 w-6 h-6 text-xs flex items-center justify-center bg-purple-200">2</span>
          <span className="text-gray-600">Print / Save</span>
        </div>
        <DocumentForm docType="quotation" />
      </div>
    </div>
  );
};

export default Page;
