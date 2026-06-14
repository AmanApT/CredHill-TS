import React from "react";
import { DocumentHeader } from "@/components/document/DocumentHeader";
import DocumentList from "@/components/document/DocumentList";

const Page = () => {
  return (
    <div>
      <DocumentHeader docType="proforma" variant="list" />
      <div className="p-2">
        <DocumentList docType="proforma" />
      </div>
    </div>
  );
};

export default Page;
