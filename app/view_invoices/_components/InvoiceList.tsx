"use client"
import { Button } from "@/components/ui/button";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import Link from "next/link";
import React from "react";

const InvoiceList = () => {
  const {invoices} = useInvoiceContext();
  console.log(invoices)
  return (
    <section>
      <div className="overflow-x-auto">
        <table className="w-full  divide-gray-200 bg-white text-sm">
          <thead className="">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                Invoice No
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                Date
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                Amount
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                Tax
              </th>

              <th className="px-4 py-2"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {invoices?.map((eachInvoice) => {
              return (
                <tr key={eachInvoice?.invoiceNo}>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                    {eachInvoice?.invoiceNo}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {eachInvoice?.date}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {eachInvoice?.totalAmount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {eachInvoice?.tax}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <Link
                      href={`create_invoice/${eachInvoice?._id}`}
                                         >
                      <Button>Edit/View</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default InvoiceList;
