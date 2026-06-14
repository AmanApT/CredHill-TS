import React from "react";
import { DocumentHeader } from "@/components/document/DocumentHeader";
import DocumentList from "@/components/document/DocumentList";

const Page = () => {
  return (
    <div>
      <DocumentHeader docType="quotation" variant="list" />
      <div className="p-2">
        <DocumentList docType="quotation" />
      </div>
    </div>
  );
};

export default Page;
