"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TableRow, useInvoiceContext } from "@/contexts/InvoiceContexts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import { MdDelete } from "react-icons/md";
import { Input } from "@/components/ui/input";

// Types

const InvoiceForm: React.FC = () => {
  const {
    invoiceFormData,
    setInvoiceFormData,
    companyDetails,
    setCompanyDetails,
    tableRows,
    setTableRows,
    includeBankDetails,
    setIncludeBankDetails,
  } = useInvoiceContext();

  const convex = useConvex();
  const { user } = useKindeBrowserClient();

  const [clients, setClients] = useState([]);
  const getUser = async () => {
    if (!user?.email) return; // Skip if email is not available
    try {
      const result = await convex.query(api.functions.user.getUser, {
        email: user?.email,
      });
      if (result && result.length > 0) {
        setCompanyDetails((prevDetails) => ({
          ...prevDetails,
          billedBy: result[0],
        }));
      } else {
        console.warn("No user found with this email");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
    }
  };
  console.log(tableRows, "cccc");
  useEffect(() => {
    getUser();
    if (user?.email) {
      getBankDetails();
    }
  }, [user]);
  const getBankDetails = async () => {
    try {
      const result = await convex.query(api.functions.account.getBankDetails, {
        email: user?.email,
      });
      if (result && result.length > 0) {
        setCompanyDetails((prevDetails) => ({
          ...prevDetails,
          accountInfo: result[0],
        })); // Update state with the first result
      } else {
        console.warn("No user found with this email");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
    }
  };

  const getAllClients = async () => {
    const result = await convex.query(api.functions.clients.getClients, {
      email: user?.email || "",
    });
    console.log(result);
    setClients(result);
  };
  useEffect(() => {
    if (user?.email !== undefined) {
      getAllClients();
    }
  }, [user]);
  console.log(includeBankDetails, "Hello");
  const [selectedClient, setSelectedClient] = useState(null);

  const handleSelectChange = (value) => {
    const client = clients.find((client) => client?.clientName === value);

    setCompanyDetails((prevDetails) => ({
      ...prevDetails,
      billedTo: client,
    }));
  };

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
        igst: 0,
        gstRate: 18,
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
        sums.igst += row.igst;
        sums.total += row.total;
        return sums;
      },
      { amount: 0, cgst: 0, sgst: 0, total: 0, igst: 0 }
    );
  };

  const { amount, cgst, sgst, total, igst } = calculateTotalSums();
  const handleChange = (
    index: number,
    field: keyof TableRow,
    value: string | number
  ) => {
    const updatedRows = tableRows.map((tableRow, i) =>
      i === index
        ? {
            ...tableRow,
            [field]: value,
            // Auto-calculate fields based on Quantity & Rate
            ...(field === "quantity" || field === "rate"
              ? (() => {
                  const quantity = field === "quantity" ? value : tableRow.quantity;
                  const rate = field === "rate" ? value : tableRow.rate;
                  const amount = quantity * rate;
                  const isLocalGST =
                    companyDetails?.billedTo?.gst?.substring(0, 2) === "07";
                  const gstRate = tableRow.gstRate;
  
                  return {
                    amount,
                    cgst: isLocalGST ? (amount * gstRate) / 200 : 0,
                    sgst: isLocalGST ? (amount * gstRate) / 200 : 0,
                    igst: isLocalGST ? 0 : (amount * gstRate) / 100,
                    total: isLocalGST
                      ? amount + (amount * gstRate) / 100
                      : amount + (amount * gstRate) / 100,
                  };
                })()
              : {}),
          }
        : tableRow
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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: string | undefined,
    field: string
  ) => {
    setInvoiceFormData({ ...invoiceFormData, [field]: e.target.value });
  };
  return (
    <div className="m-4 p-6 w-full mx-auto bg-white shadow-lg rounded-md ">
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="w-32 ">
            Invoice No <span className="text-red-600">*</span>{" "}
          </span>
          <input
            type="number"
            value={invoiceFormData.invoiceNo}
            onChange={(e) => handleInputChange(e, undefined, "invoiceNo")}
            className="mt-1 border-0 border-b-[1.2px] block w-48 p-2 focus:outline-none"
          />
        </div>
        <div>
          <div className="flex items-center">
            <span className="w-32">Venue </span>
            <input
              type="text"
              value={invoiceFormData.venue}
              onChange={(e) => handleInputChange(e, undefined, "venue")}
              className="mt-1 block w-48 p-2 focus:outline-none border-b-[1.2px]"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <span className="w-32">Approval ID </span>
            <input
              type="text"
              value={invoiceFormData.approvalId}
              onChange={(e) => handleInputChange(e, undefined, "approvalId")}
              className="mt-1 block w-48 p-2 focus:outline-none border-b-[1.2px]"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <span className="w-32">Order Ref </span>
            <input
              type="text"
              value={invoiceFormData.referredBy}
              onChange={(e) => handleInputChange(e, undefined, "referredBy")}
              className="mt-1 block w-48 p-2 focus:outline-none border-b-[1.2px]"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <span className="w-32">
              Date <span className="text-red-600">*</span>{" "}
            </span>
            <input
              type="date"
              value={invoiceFormData.date}
              onChange={(e) => handleInputChange(e, undefined, "date")}
              className="mt-1 block w-48 p-2 focus:outline-none border-0 border-b-[1.2px]"
            />
          </div>
        </div>
      </div>

      <div className="flex  justify-between gap-6 mt-8">
        <div className="bg-slate-50 rounded-md p-4">
          <div className="text-sm flex gap-5 mb-2 items-center">
            <span className=" font-semibold text-lg">Billed By</span>
            <span className="text-gray-500">Your Details</span>
          </div>
          <div>
            <Select onValueChange={handleSelectChange}>
              <SelectTrigger className="w-[380px]">
                <SelectValue placeholder="Billed By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Shivam">Shivam Projection</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {true && (
            <div className=" p-4 bg-white border my-3 rounded-md flex flex-col gap-2">
              {/* <p className="text-[#6538BF]">Billed By</p> */}
              <p className="font-bold my-2">Business Details</p>
              <p>SHIVAM PROJECTION</p>
              <p>241,242 L Extension, Mohan Garden, </p>
              <p>Delhi, India- 110059</p>
              <div>
                <span className="font-bold">GSTIN:</span>
                <span>07APZPP6140C1ZL</span>
              </div>
              <div>
                <span className="font-bold">Email ID:</span>
                <span>shivamprojection@gmail.com</span>
              </div>
              <div>
                <span className="font-bold">Phone:</span>
                <span>9899569229</span>
              </div>
            </div>
          )}
        </div>
        <div className="bg-slate-50 rounded-md p-4">
          <div className="text-sm flex gap-5 mb-2 items-center">
            <span className=" font-semibold text-lg">Billed To</span>
            <span className="text-gray-500">Client Details</span>
          </div>
          <div>
            <Select onValueChange={handleSelectChange}>
              <SelectTrigger className="w-[380px]">
                <SelectValue placeholder="Billed To" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clients?.map((eachClient, id) => {
                    return (
                      <SelectItem
                        key={eachClient?._id}
                        value={eachClient?.clientName}
                      >
                        {eachClient?.clientName}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {companyDetails?.billedTo?.clientName !== "" ? (
            <div className=" p-4 bg-white border my-3 rounded-md flex flex-col gap-2">
              {/* <p className="text-[#6538BF]">Billed By</p> */}
              <p className="font-bold my-2">Client Details</p>
              <p>{companyDetails?.billedTo?.clientName}</p>
              <p>{companyDetails?.billedTo?.add} </p>
              <p>
                {" "}
                {companyDetails?.billedTo?.city},{" "}
                {companyDetails?.billedTo?.pincode}
              </p>
              <div>
                <span className="font-bold">GSTIN: </span>
                <span>{companyDetails?.billedTo?.gst}</span>
              </div>
              <div>
                <span className="font-bold">PAN: </span>
                <span>{companyDetails?.billedTo?.pan}</span>
              </div>
              <div>
                <span className="font-bold">Phone:</span>
                <span>9899569229</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center my-3 gap-3 p-4 bg-white border rounded-md">
              <p>Select a Business/Client</p>
              <p>Or</p>
              <Button className="bg-purple-500">Add a new client</Button>
            </div>
          )}
        </div>
      </div>
      <div className=" mt-4 mx-auto rounded">
        <h2 className="text-xl font-semibold mb-6">Invoice Items</h2>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-purple-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 ">
                  Item name
                </th>
                <th scope="col" className="px-6 py-3">
                  GST Rate
                </th>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Description
                </th>
                <th scope="col" className="px-6 py-3">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3">
                  Rate
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                {companyDetails?.billedTo?.gst?.substring(0, 2) == "07" ? (
                  <>
                    <th scope="col" className="px-6 py-3">
                      CGST
                    </th>
                    <th scope="col" className="px-6 py-3">
                      SGST
                    </th>
                  </>
                ) : (
                  <th scope="col" className="px-6 py-3">
                    IGST
                  </th>
                )}

                <th scope="col" className="px-6 py-3">
                  Total
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows?.map((row, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-3 py-4  font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <Input
                      value={row.item}
                      onChange={(e) =>
                        handleChange(index, "item", e.target.value)
                      }
                      className="w-40"
                    />
                  </th>
                  <td className="px-3 py-4">
                    <Input
                      value={row.gstRate}
                      onChange={(e) => {
                        handleChange(index, "gstRate", Number(e.target.value));
                        // calculateTotalSums()
                      }}
                      className="w-16"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Input
                      value={row.date}
                      onChange={(e) =>
                        handleChange(index, "date", e.target.value)
                      }
                      className="w-36"
                      type="date"
                    />
                  </td>
                  <td className="px-3 py-4">
                    {" "}
                    <Input
                      value={row.description}
                      onChange={(e) =>
                        handleChange(index, "description", e.target.value)
                      }
                      className="w-48"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Input
                      value={row.quantity}
                      onChange={(e) =>
                        handleChange(index, "quantity", Number(e.target.value))
                      }
                      className="w-16"
                      type="number"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Input
                      value={row.rate}
                      onChange={(e) =>
                        handleChange(index, "rate", Number(e.target.value))
                      }
                      className="w-24"
                      type="number"
                    />
                  </td>
                  <td className="px-3 py-4">{row.amount.toFixed(2)}</td>
                  {companyDetails?.billedTo?.gst?.substring(0, 2) === "07" ? (
                    <>
                      <td className="px-3 py-4">{row.cgst.toFixed(2)}</td>
                      <td className="px-3 py-4">{row.sgst.toFixed(2)}</td>
                    </>
                  ) : (
                    <td className="px-3 py-4">{row.igst.toFixed(2)}</td>
                  )}

                  <td className="px-3 py-4">{row.total.toFixed(2)}</td>
                  <td className="px-3 py-4 text-black">
                    <button
                      onClick={() => deleteRow(index)}
                      className="text-black hover:underline flex "
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={addRow}
          className="my-4  px-4 py-2 bg-purple-400 text-white rounded shadow hover:bg-purple-600"
        >
          Add New Entry
        </button>
      </div>

      <div className="flex">
        <div className="w-[70%]">
          <div className="flex items-center my-4">
            <label htmlFor="bank-details-switch" className="mr-2">
              Bank Details
            </label>
            <button
              id="bank-details-switch"
              onClick={() => setIncludeBankDetails(!includeBankDetails)}
              className={`${
                includeBankDetails ? "bg-purple-500" : "bg-gray-400"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer`}
            >
              <span
                className={`${
                  includeBankDetails ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
              />
            </button>
          </div>
        </div>
        {/* <div className="flex flex-col ">
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
        </div> */}
        <div className="w-1/3 pr-4">
          <div className="mt-4 flex justify-between ">
            <div className=" flex flex-col gap-2">
              <p>Amount</p>
              {companyDetails?.billedTo?.gst?.substring(0, 2) === "07" ? (
                <>
                  <p>CGST</p>
                  <p>SGST</p>
                </>
              ) : (
                <p>IGST</p>
              )}
            </div>
            <div className="flex flex-col gap-2 ">
              <p>₹ {amount.toFixed(2)}</p>
              {companyDetails?.billedTo?.gst?.substring(0, 2) === "07" ? (
                <>
                  <p>₹ {cgst.toFixed(2)} </p>
                  <p>₹ {sgst.toFixed(2)}</p>
                </>
              ) : (
                <p>₹ {igst.toFixed(2)}</p>
              )}
            </div>
          </div>
          <hr className="mt-4 border border-black" />
          <div className="py-1 flex text-lg justify-between font-bold">
            <span>Total (INR)</span>
            <span>₹ {total.toFixed(2)}</span>
          </div>
          <hr className="border border-black" />
          <div>{/* sign */}</div>
        </div>
      </div>
      <Link href={"/preview_invoice"}>
        <Button>Preview</Button>
      </Link>
    </div>
  );
};

export default InvoiceForm;
