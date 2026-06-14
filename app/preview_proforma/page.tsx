import React from "react";
import DocumentPreview from "@/components/document/DocumentPreview";

const Page = () => {
  return (
    <div className="p-4 bg-slate-300">
      <DocumentPreview docType="proforma" />
    </div>
  );
};

export default Page;
