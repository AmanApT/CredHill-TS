import React from "react";
import Header from "../_components/Header";
import InvoiceForm from "../_components/InvoiceForm";

const page = () => {
  return (
    <div className="">
      <Header />
      <div className="p-6 px-24 bg-gray-100 ">
        <div className="flex gap-4 items-center justify-center">
          <span className="rounded-full w-6 h-6 text-xs flex items-center justify-center text-white bg-purple-700">
            1
          </span>
          <span className="text-gray-900">Invoice Details</span>
          <span className="text-gray-600"> {">"}</span>
          <span className="rounded-full text-gray-600 w-6 h-6 text-xs flex items-center justify-center  bg-purple-200">
            2
          </span>

          <span className="text-gray-600">Print / Save</span>
        </div>
        <InvoiceForm />
      </div>
    </div>
  );
};

export default page;
