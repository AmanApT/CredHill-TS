"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import moment from "moment";
import Link from "next/link";
// import Link from "next/link";
import React from "react";

const InvoiceList = () => {
  const { invoices } = useInvoiceContext();
  console.log(invoices);
  return (
    // <section>
    //   <div className="overflow-x-auto">
    //     <table className="w-full  divide-gray-200 bg-white text-sm">
    //       <thead className="">
    //         <tr>
    //           <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
    //             Invoice No
    //           </th>
    //           <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
    //             Date
    //           </th>
    //           <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
    //             Amount
    //           </th>
    //           <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
    //             Tax
    //           </th>

    //           <th className="px-4 py-2"></th>
    //         </tr>
    //       </thead>

    //       <tbody className="divide-y divide-gray-200">
    //         {invoices?.map((eachInvoice) => {
    //           return (
    //             <tr key={eachInvoice?.invoiceNo}>
    //               <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
    //                 {eachInvoice?.invoiceNo}
    //               </td>
    //               <td className="whitespace-nowrap px-4 py-2 text-gray-700">
    //                 {eachInvoice?.date}
    //               </td>
    //               <td className="whitespace-nowrap px-4 py-2 text-gray-700">
    //                 {eachInvoice?.totalAmount}
    //               </td>
    //               <td className="whitespace-nowrap px-4 py-2 text-gray-700">
    //                 {eachInvoice?.tax}
    //               </td>
    //               <td className="whitespace-nowrap px-4 py-2">
                    // <Link
                    //   href={`create_invoice/${eachInvoice?._id}`}
                    //                      >
                    //   <Button>Edit/View</Button>
                    // </Link>
    //               </td>
    //             </tr>
    //           );
    //         })}
    //       </tbody>
    //     </table>
    //   </div>
    // </section>

    <div className="relative overflow-x-auto shadow-md sm:rounded-lg p-4">
      <div className="pb-4 bg-white dark:bg-gray-900 ">
        <label className="sr-only">Search</label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <Input
            type="text"
            id="table-search"
            className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for items"
          />
        </div>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase  bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr className="">
            <th scope="col" className="px-6 py-3 ">
              Invoice No
            </th>
            <th scope="col" className="px-6 py-3">
              Invoice Date
            </th>
            <th scope="col" className="px-6 py-3">
              Total Amount
            </th>
            <th scope="col" className="px-6 py-3">
              Taxes
            </th>
            <th scope="col" className="px-6 py-3">
              Updated At
            </th>
            <th scope="col" className="px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices?.map((eachInvoice, id) => {
            return (
              <tr
                key={eachInvoice?._creationTime}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {eachInvoice?.invoiceNo}
                </th>
                <td className="px-6 py-4">
                  {moment(eachInvoice?.date).format("DD MMMM, YYYY")}
                </td>
                <td className="px-6 py-4">{eachInvoice?.totalAmount}</td>
                <td className="px-6 py-4">{eachInvoice?.tax}</td>
                <td className="px-6 py-4">
                  {moment(eachInvoice?._creationTime).format("DD MMMM YYYY")}
                </td>
                <td className="px-6 py-4">
                <Link
                      href={`create_invoice/${eachInvoice?._id}`}
                                         >
                      <Button className="p-3" >Edit/View</Button>
                    </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;
