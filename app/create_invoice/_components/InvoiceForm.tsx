"use client";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TableRow, useInvoiceContext } from "@/contexts/InvoiceContexts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Delete, DeleteIcon } from "lucide-react";
import { MdDelete } from "react-icons/md";

// Types

const InvoiceForm: React.FC = () => {
  const {
    invoiceFormData,
    setInvoiceFormData,
    companyDetails,
    setCompanyDetails,
    tableRows,
    setTableRows,
  } = useInvoiceContext();

  const [showBilledBy, setShowBilledBy] = useState<boolean>(false);
  const [showBilledTo, setShowBilledTo] = useState<boolean>(false);
  const [includeBankDetails, setIncludeBankDetails] = useState<boolean>(false);
  const convex = useConvex();
  const { user } = useKindeBrowserClient();

  const [clients, setClients] = useState([]);
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
    const client = clients.find((client) => client.clientName === value);
    setSelectedClient(client);
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
                  amount:
                    (field === "quantity" ? value : tableRows.quantity) *
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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: string | undefined,
    field: string
  ) => {
    if (section === "billedBy" || section === "billedTo") {
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
                <SelectValue placeholder="Billed To" />
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
          {selectedClient ? (
            <div className=" p-4 bg-white border my-3 rounded-md flex flex-col gap-2">
              {/* <p className="text-[#6538BF]">Billed By</p> */}
              <p className="font-bold my-2">Client Details</p>
              <p>{selectedClient?.clientName}</p>
              <p>{selectedClient?.add} </p>
              <p>
                {" "}
                {selectedClient?.city}, {selectedClient?.pincode}
              </p>
              <div>
                <span className="font-bold">GSTIN:</span>
                <span>{selectedClient?.gst}</span>
              </div>
              <div>
                <span className="font-bold">PAN:</span>
                <span>{selectedClient?.gst}</span>
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
        <div className=" overflow-x-scroll">
          <table className=" border-collapse  text-sm ">
            <thead className="bg-purple-600 text-white">
              <tr className=" ">
                <th className="w-48 border-gray-300 p-2  text-left rounded-tl-md">
                  Item Name
                </th>
                <th className="w-24  p-2 ">GST Rate (%)</th>
                <th className="  p-2 ">Date</th>
                <th className=" w-48 p-2">Description</th>
                <th className="w-24 p-2">Qty.</th>
                <th className="p-2">Rate</th>
                <th className="  p-2  ">Amount</th>
                {selectedClient?.gst?.substring(0, 2) == "07" ? (
                  <>
                    <th className="  p-2">CGST</th>
                    <th className="  p-2">SGST</th>
                  </>
                ) : (
                  <th className="p-2">IGST</th>
                )}

                <th className=" p-2">Total</th>
                <th className="rounded-tr-md p-2">...</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 overflow-x-scroll w-[50vw]"
                >
                  <td className=" p-2">
                    <input
                      type="text"
                      value={row.item}
                      onChange={(e) =>
                        handleChange(index, "item", e.target.value)
                      }
                      className="w-full border-b-2  p-1"
                    />
                  </td>
                  <td className=" p-2">
                    <input
                      type="number"
                      value={row.gstRate}
                      onChange={(e) =>
                        handleChange(index, "gstRate", Number(e.target.value))
                      }
                      className="w-full border-b-2  p-1"
                    />
                  </td>
                  <td className=" p-2">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        handleChange(index, "date", e.target.value)
                      }
                      className="w-full border-b-2  p-1"
                    />
                  </td>
                  <td className=" p-2">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        handleChange(index, "description", e.target.value)
                      }
                      className="w-full border-b-2  p-1"
                    />
                  </td>
                  <td className=" p-2">
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) =>
                        handleChange(index, "quantity", Number(e.target.value))
                      }
                      className="w-full border-b-2  p-1"
                    />
                  </td>
                  <td className=" p-2">
                    <input
                      type="number"
                      value={row.rate}
                      onChange={(e) =>
                        handleChange(index, "rate", Number(e.target.value))
                      }
                      className="w-full border-b-2  p-1"
                    />
                  </td>

                  {/* <td className=" p-2 w-8">{row.amount.toFixed(2)}</td> */}
                  <td>
                    <input
                      type="number"
                      disabled
                      value={row.amount.toFixed(2)}
                      className="w-full  p-1"
                    />
                  </td>

                  {selectedClient?.gst?.substring(0, 2) == "07" ? (
                    <>
                      {" "}
                      <td>
                        <input
                          type="number"
                          disabled
                          value={row.cgst.toFixed(2)}
                          className="  p-1"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          disabled
                          value={row.sgst.toFixed(2)}
                          className="  p-1"
                        />
                      </td>
                    </>
                  ) : (
                    <td className="p-2 ">1</td>
                  )}

                  {/* <td className=" p-2 w-8">{row.total.toFixed(2)}</td> */}
                  <td>
                    <input
                      type="number"
                      disabled
                      value={row.total.toFixed(2)}
                      className="   p-1"
                    />
                  </td>
                  <td className=" p-2 ">
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
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
        >
          Add Row
        </button>
      </div>

      <div className="flex">
        <div className="w-[70%]">
          <label htmlFor="">Include bank details :</label>
          <input
            checked={includeBankDetails}
            onChange={() => {
              setIncludeBankDetails(!includeBankDetails);
            }}
            type="checkbox"
            name=""
            id=""
          />
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
      <Link href={"/preview_invoice"}>
        <Button>Preview</Button>
      </Link>
    </div>
  );
};

export default InvoiceForm;
