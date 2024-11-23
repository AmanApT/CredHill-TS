import React from "react";

const Invoices = () => {
  const invoices = [
    {
      invoiceNo: 1,
      clientName: "Cipla",
      invoiceDate: "1234",
      totalAmount: 5000,
    },
    {
      invoiceNo: 2,
      clientName: "Cipla",
      invoiceDate: "1234",
      totalAmount: 5000,
    },
    {
      invoiceNo: 3,
      clientName: "Cipla",
      invoiceDate: "1234",
      totalAmount: 5000,
    },
  ];
  return <section>
  {/*
  Heads up! 👋

  This component comes with some `rtl` classes. Please remove them if they are not needed in your project.
*/}

<div className="overflow-x-auto">
  <table className="w-full  divide-gray-200 bg-white text-sm">
    <thead className="">
      <tr>
      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">Name</th>
      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">Name</th>
      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">Name</th>
      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">Name</th>
              
       
        <th className="px-4 py-2"></th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200">
        {
            invoices?.map((eachInvoice)=>{
                return  <tr key={eachInvoice?.invoiceNo}>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">{eachInvoice?.clientName}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">{eachInvoice?.invoiceDate}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">{eachInvoice?.invoiceNo}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">{eachInvoice?.totalAmount}</td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <a
                        href="#"
                        className="inline-block rounded bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                      >
                        View
                      </a>
                    </td>
                  </tr>
            })
        }
     

     
    </tbody>
  </table>
</div>
  </section>;
};

export default Invoices;
