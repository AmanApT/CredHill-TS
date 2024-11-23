"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TableRow, useInvoiceContext } from "@/contexts/InvoiceContexts";


// Types

const InvoiceForm: React.FC = () => {
  const { invoiceFormData, setInvoiceFormData, companyDetails, setCompanyDetails,tableRows,setTableRows } = useInvoiceContext();

  const [showBilledBy, setShowBilledBy] = useState<boolean>(false);
  const [showBilledTo, setShowBilledTo] = useState<boolean>(false);
  const[includeBankDetails, setIncludeBankDetails] = useState<boolean>(false);
  console.log(includeBankDetails,"Hello");
  // const router = useRouter();

  // const [rows, setRows] = useState<TableRow[]>([
  //   {
  //     item: "Sample Item",
  //     gstRate: 18,
  //     date: new Date().toISOString().split('T')[0], // Default to current date
  //     description: "Sample Description",
  //     quantity: 1,
  //     rate: 100,
  //     amount: 100,
  //     cgst: 9,
  //     sgst: 9,
  //     total: 118,
  //   },
  // ]);

  const addRow = () => {
    setTableRows([
      ...tableRows,
      {
        item: "",
        gstRate: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
        quantity: 0,
        rate: 0,
        amount: 0,
        cgst: 0,
        sgst: 0,
        total: 0,
      },
    ]);
  };

  const deleteRow = (index: number) => {
    setTableRows(tableRows.filter((_, i) => i !== index));
  };
  const calculateTotalSums = () => {
    return tableRows.reduce(
      (sums, row) => {
        sums.amount += row.amount;
        sums.cgst += row.cgst;
        sums.sgst += row.sgst;
        sums.total += row.total;
        return sums;
      },
      { amount: 0, cgst: 0, sgst: 0, total: 0 }
    );
  };

  const { amount, cgst, sgst, total } = calculateTotalSums();
  const handleChange = (
    index: number,
    field: keyof TableRow,
    value: string | number
  ) => {
    const updatedRows = tableRows.map((tableRows, i) =>
      i === index
        ? {
            ...tableRows,
            [field]: value,
            // Auto-calculate fields based on Quantity & Rate
            ...(field === "quantity" || field === "rate"
              ? {
                  amount: (field === "quantity" ? value : tableRows.quantity) *
                    (field === "rate" ? value : tableRows.rate),
                  cgst:
                    ((field === "quantity" ? value : tableRows.quantity) *
                      (field === "rate" ? value : tableRows.rate) *
                      tableRows.gstRate) /
                    200,
                  sgst:
                    ((field === "quantity" ? value : tableRows.quantity) *
                      (field === "rate" ? value : tableRows.rate) *
                      tableRows.gstRate) /
                    200,
                  total:
                    ((field === "quantity" ? value : tableRows.quantity) *
                      (field === "rate" ? value : tableRows.rate) *
                      (100 + tableRows.gstRate)) /
                    100,
                }
              : {}),
          }
        : tableRows
    );
    setTableRows(updatedRows);
  };
  // const [formData, setFormData] = useState<InvoiceFormData>({
  //   invoiceNo: "",
  //   venue: "",
  //   referredBy: "",
  //   approvalId:"",
  //   date: new Date().toISOString().split('T')[0],
  //   billedBy: {
  //     companyName: "",
  //     companyAddress: "",
  //     gstin: "",
  //     email: "",
  //     phone: "",
  //   },
  //   billedTo: {
  //     companyName: "",
  //     companyAddress: "",
  //     gstin: "",
  //     email: "",
  //     phone: "",
  //   },
  // });

  // Input change handler
  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   section?: "billedBy" | "billedTo",
  //   field?:
  //     | keyof CompanyDetails
  //     | keyof Omit<InvoiceFormData, "billedBy" | "billedTo">
  // ) => {
  //   const value = e.target.value;
  //   if (section && field) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [section]: {
  //         ...prev[section],
  //         [field]: value,
  //       },
  //     }));
  //   } else if (field) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [field]: value,
  //     }));
  //   }
  // };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, section: string | undefined, field: string) => {
    if (section === 'billedBy' || section === 'billedTo') {
      setCompanyDetails({
        ...companyDetails,
        [section]: {
          ...companyDetails[section],
          [field]: e.target.value,
        },
      });
    } else {
      setInvoiceFormData({ ...invoiceFormData, [field]: e.target.value });
    }
  };
  return (
    <div className="m-4 p-6 w-screen mx-auto bg-white shadow-md rounded">
      
      <div className="space-y-4">
        <div className="flex items-center">
          <span className="w-32">Invoice No: </span>
          <input
            type="number"
            value={invoiceFormData.invoiceNo}
            onChange={(e) => handleInputChange(e, undefined, "invoiceNo")}
            className="mt-1 border-0 border-b-2 block w-24 p-2 focus:outline-none"
          />
        </div>
        <div>
          <div className="flex items-center">
            <span className="w-32">Venue: </span>
            <input
              type="text"
              value={invoiceFormData.venue}
              onChange={(e) => handleInputChange(e, undefined, "venue")}
              className="mt-1 block w-48 p-2 focus:outline-none  border-b-2"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <span className="w-32">Approval ID: </span>
            <input
              type="text"
              value={invoiceFormData.approvalId}
              onChange={(e) => handleInputChange(e, undefined, "approvalId")}
              className="mt-1 block w-48 p-2 focus:outline-none  border-b-2"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <span className="w-32">Order Ref: </span>
            <input
              type="text"
              value={invoiceFormData.referredBy}
              onChange={(e) => handleInputChange(e, undefined, "referredBy")}
              className="mt-1 block w-48 p-2 focus:outline-none border-b-2"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <span className="w-32">Date: </span>
            <input
              type="date"
              value={invoiceFormData.date}
              onChange={(e) => handleInputChange(e, undefined, "date")}
              className="mt-1 block w-48 p-2 focus:outline-none  border-b-2"
            />
          </div>
        </div>
      </div>

      <div className="flex  justify-around gap-6 mt-8">
        <div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-4">Billed By</DropdownMenuTrigger>
            <DropdownMenuContent  className="w-72">
              <DropdownMenuItem onClick={()=>{setShowBilledBy(true)}} >SHIVAM PROJECTION</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          {
            showBilledBy && <div className="bg-[#EFEBF8] p-4 rounded-sm">
            {/* <p className="text-[#6538BF]">Billed By</p> */}
            <p>SHIVAM PROJECTION</p>
            <p>241,242 L Extension, Mohan Garden, </p>
            <p>Delhi, India- 110059</p>
            <div>
              <span className="font-bold">GSTIN:</span>
              <span>07APZPP6140C1ZL</span>
            </div>
            <div>
              <span className="font-bold">Email:</span>
              <span>shivamprojection@gmail.com</span>
            </div>
            <div>
              <span className="font-bold">Phone:</span>
              <span>9899569229</span>
            </div>
          </div>
          }
          
        </div>
        <div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-4">Billed To</DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuItem onClick={()=>{setShowBilledTo(true)}} >Cipla Limited</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>{setShowBilledTo(true)}} >Zydus</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>{setShowBilledTo(true)}} >Company </DropdownMenuItem>
              <DropdownMenuItem onClick={()=>{setShowBilledTo(true)}} >My Company</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          {
            showBilledTo && <div className="bg-[#EFEBF8] p-4 rounded-sm">
            {/* <p className="text-[#6538BF]">Billed To</p> */}
            <p>SHIVAM PROJECTION</p>
            <p>241,242 L Extension, Mohan Garden, </p>
            <p>Delhi, India- 110059</p>
            <div>
              <span className="font-bold">GSTIN:</span>
              <span>07APZPP6140C1ZL</span>
            </div>
            <div>
              <span className="font-bold">Email:</span>
              <span>shivamprojection@gmail.com</span>
            </div>
            <div>
              <span className="font-bold">Phone:</span>
              <span>9899569229</span>
            </div>
          </div>
          }
          
        </div>
       
        
       
     
        {/* Billed By Column */}
        {/* <div className="flex-1">
          <h3 className="text-lg font-medium mb-4">Billed By</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Company Name:
                <input
                  type="text"
                  value={formData.billedBy.companyName}
                  onChange={(e) =>
                    handleInputChange(e, "billedBy", "companyName")
                  }
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Company Address:
                <input
                  type="text"
                  value={formData.billedBy.companyAddress}
                  onChange={(e) =>
                    handleInputChange(e, "billedBy", "companyAddress")
                  }
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                GSTIN:
                <input
                  type="text"
                  value={formData.billedBy.gstin}
                  onChange={(e) => handleInputChange(e, "billedBy", "gstin")}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Email ID:
                <input
                  type="email"
                  value={formData.billedBy.email}
                  onChange={(e) => handleInputChange(e, "billedBy", "email")}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Phone No:
                <input
                  type="text"
                  value={formData.billedBy.phone}
                  onChange={(e) => handleInputChange(e, "billedBy", "phone")}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
          </div>
        </div> */}

        {/* Billed To Column */}
        {/* <div className="flex-1">
          <h3 className="text-lg font-medium mb-4">Billed To</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Company Name:
                <input
                  type="text"
                  value={formData.billedTo.companyName}
                  onChange={(e) =>
                    handleInputChange(e, "billedTo", "companyName")
                  }
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Company Address:
                <input
                  type="text"
                  value={formData.billedTo.companyAddress}
                  onChange={(e) =>
                    handleInputChange(e, "billedTo", "companyAddress")
                  }
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                GSTIN:
                <input
                  type="text"
                  value={formData.billedTo.gstin}
                  onChange={(e) => handleInputChange(e, "billedTo", "gstin")}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Email ID:
                <input
                  type="email"
                  value={formData.billedTo.email}
                  onChange={(e) => handleInputChange(e, "billedTo", "email")}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Phone No:
                <input
                  type="text"
                  value={formData.billedTo.phone}
                  onChange={(e) => handleInputChange(e, "billedTo", "phone")}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </label>
            </div>
          </div>
        </div> */}


      </div>
      <div className=" mt-4 mx-auto  rounded">
      <h2 className="text-xl font-semibold mb-6">Invoice Items</h2>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2">Item</th>
            <th className="border border-gray-300 p-2">GST Rate (%)</th>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Description</th>
            <th className="border border-gray-300 p-2">Quantity</th>
            <th className="border border-gray-300 p-2">Rate</th>
            <th className="border border-gray-300 p-2">Amount</th>
            <th className="border border-gray-300 p-2">CGST</th>
            <th className="border border-gray-300 p-2">SGST</th>
            <th className="border border-gray-300 p-2">Total</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  value={row.item}
                  onChange={(e) =>
                    handleChange(index, "item", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded p-1"
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  value={row.gstRate}
                  onChange={(e) =>
                    handleChange(index, "gstRate", Number(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded p-1"
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => handleChange(index, "date", e.target.value)}
                  className="w-full border border-gray-300 rounded p-1"
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded p-1"
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) =>
                    handleChange(index, "quantity", Number(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded p-1"
                />
              </td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) =>
                    handleChange(index, "rate", Number(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded p-1"
                />
              </td>
              <td className="border border-gray-300 p-2">{row.amount.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{row.cgst.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{row.sgst.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{row.total.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => deleteRow(index)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addRow}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
      >
        Add Row
      </button>
    </div>
    
    <div className="flex">
          <div className="w-[70%]">
            <label htmlFor="">
              Include bank details : 
              </label><input checked={includeBankDetails} onChange={()=>{setIncludeBankDetails(!includeBankDetails)}} type="checkbox" name="" id="" />
          </div>
    <div className="flex flex-col ">
    <div>
      <span>Amount</span>
      <span>{amount.toFixed(2)}</span>
    </div>
    <div>
      <span>CGST</span>
      <span>{cgst.toFixed(2)}</span>
    </div>
    <div>
      <span>SGST</span>
      <span>{sgst.toFixed(2)}</span>
    </div>
    <div>
      <span>Total (INR)</span>
      <span>Rs. {total.toFixed(2)}</span>
    </div>
    </div>
    </div>
    <Link href={'/preview_invoice'}>
          <Button>Preview</Button>
    </Link>
    </div>
  );
};

export default InvoiceForm;
