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

import { MdAdd, MdAddBox, MdDelete } from "react-icons/md";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    invoices,
    items,
    setItems,
  } = useInvoiceContext();
  console.log(invoices, "allInvoices");
  const convex = useConvex();
  const { user } = useKindeBrowserClient();
  const [clients, setClients] = useState([]);

  const getAllItems = async () => {
    const result = await convex.query(api.functions.items.getItems, {
      email: user?.email,
    });
    console.log(result);
    setItems(result);
  };
  const [openStates, setOpenStates] = useState({});
  const toggleOpenState = (rowIndex, isOpen) => {
    setOpenStates((prev) => ({
      ...prev,
      [rowIndex]: isOpen,
    }));
  };

  const params = useParams<{
    invoiceId: string;
    tag: string;
    item: string;
  }>();
  const router = useRouter();
  useEffect(() => {
    if (params?.invoiceId !== undefined) {
      console.log("Chalaa");
      const foundInvoice = invoices?.find(
        (inv) => inv?._id === params?.invoiceId
      );
      console.log(foundInvoice, "found");
      setInvoiceFormData({
        invoiceNo: foundInvoice?.invoiceNo,
        venue: foundInvoice?.venue,
        referredBy: foundInvoice?.ref,
        date: foundInvoice?.date,
        approvalId: foundInvoice?.approvalId,
      });
      const clientId = foundInvoice?.clientId;
      console.log(clientId, "clientId");
      const client = clients.find((client) => client._id === clientId);
      console.log(client, "client");
      setCompanyDetails((prevDetails) => ({
        ...prevDetails,
        billedTo: client,
      }));

      setTableRows(JSON?.parse(foundInvoice?.item));
    }
  }, [
    clients,
    invoices,
    params?.invoiceId,
    setCompanyDetails,
    setInvoiceFormData,
    setTableRows,
  ]);

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
      getAllItems();
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
  // const [selectedClient, setSelectedClient] = useState(null);

  const handleSelectChange = (value: unknown) => {
    const client = clients.find((client) => client?.clientName === value);

    setCompanyDetails((prevDetails) => ({
      ...prevDetails,
      billedTo: client,
    }));
  };
  console.log(clients, "allClients");
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
        hsn: "",
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
    if (tableRows.length == 1) {
      return;
    }
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
  useEffect(() => {
    if (invoices !== undefined) {
      const sortedInvoices = [...invoices].sort(
        (a, b) => b._creationTime - a._creationTime
      );

      const mostRecentInvoice = sortedInvoices[0]?.invoiceNo;
      setInvoiceFormData({
        ...invoiceFormData,
        invoiceNo: (parseInt(mostRecentInvoice) + 1).toString(),
      });
    }
  }, [invoices]);
  const previewInvoice = () => {
    if (invoiceFormData?.invoiceNo === "") {
      toast("Invoice number can't be empty!", {
        style: {
          backgroundColor: "black",
          color: "white",
        },
      });

      // alert("Invoice cannot be empty")
      return;
    }
    if (companyDetails?.billedTo?.clientName === "") {
      toast("Select Client", {
        style: {
          backgroundColor: "black",
          color: "white",
        },
      });
      return;
    }

    if (params?.invoiceId === undefined) {
      router.push("/preview_invoice");
    } else {
      router.push(`/update_invoice/${params?.invoiceId}`);
    }
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
                  const quantity =
                    field === "quantity" ? value : tableRow.quantity;
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
            type="text"
            value={"2025-26/"}
            // onChange={(e) => handleInputChange(e, undefined, "invoiceNo")}
            className="mt-1 border-0 border-b-[1.2px] block w-20 p-2 focus:outline-none"
          />
          <input
            type="text"
            value={invoiceFormData.invoiceNo}
            onChange={(e) => handleInputChange(e, undefined, "invoiceNo")}
            className="mt-1 border-0 border-b-[1.2px] block w-32 p-2 pl-0 focus:outline-none"
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

      <div className="flex  justify-between  mt-8">
        <div className="bg-slate-50 rounded-md p-4">
          <div className="text-sm flex gap-5 mb-2 items-center">
            <span className=" font-semibold text-lg">Billed By</span>
            <span className="text-gray-500">Your Details</span>
          </div>
          <div>
            <Select>
              <SelectTrigger className="w-[440px]">
                <SelectValue placeholder="Billed By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Shivam">
                    {companyDetails?.billedBy?.companyName}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {true && (
            <div className=" p-4 bg-white border my-3 rounded-md flex flex-col gap-2">
              {/* <p className="text-[#6538BF]">Billed By</p> */}
              <p className="font-bold my-2">Business Details</p>
              <p>{companyDetails?.billedBy.companyName.toUpperCase()}</p>
              {companyDetails?.billedBy?.companyAddress && (
                <p>{companyDetails?.billedBy?.companyAddress} </p>
              )}

              <p>
                {" "}
                {companyDetails?.billedBy.city}{" "}
                {companyDetails?.billedBy.pincode}
              </p>
              {companyDetails?.billedBy.gst && (
                <div>
                  <span className="font-bold">GSTIN:</span>
                  <span>{companyDetails?.billedBy.gst}</span>
                </div>
              )}
              {companyDetails?.billedBy.email && (
                <div>
                  <span className="font-bold">Email ID:</span>
                  <span>{companyDetails?.billedBy.email}</span>
                </div>
              )}
              {companyDetails?.billedBy.contact && (
                <div>
                  <span className="font-bold">Phone:</span>
                  <span>{companyDetails?.billedBy.contact}</span>
                </div>
              )}
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
              <SelectTrigger className="w-[440px]">
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
              {companyDetails?.billedTo?.add && (
                <p>{companyDetails?.billedTo?.add} </p>
              )}

              <p>
                {" "}
                {companyDetails?.billedTo?.city}{" "}
                {companyDetails?.billedTo?.pincode}
              </p>
              {companyDetails?.billedTo?.gst && (
                <div>
                  <span className="font-bold">GSTIN: </span>
                  <span>{companyDetails?.billedTo?.gst}</span>
                </div>
              )}
              {companyDetails?.billedTo?.pan && (
                <div>
                  <span className="font-bold">PAN: </span>
                  <span>{companyDetails?.billedTo?.pan}</span>
                </div>
              )}
              {companyDetails?.billedTo?.contact && (
                <div>
                  <span className="font-bold">Phone:</span>
                  <span>{companyDetails?.billedTo?.contact}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center my-3 gap-3 p-4 bg-white border rounded-md">
              <p>Select a Business/Client</p>
              <p>Or</p>
              <Link href={"/clients"}>
                <Button className="bg-purple-500">Add a new client</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className=" mt-4 mx-auto rounded">
        <h2 className="text-xl font-semibold mb-6">Invoice Items</h2>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-black dark:text-gray-400">
            <thead className="text-xs  uppercase bg-purple-600 text-white ">
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
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-3 py-4  font-medium text-black-900 whitespace-nowrap dark:text-white"
                  >
                    {/* <Input
                      placeholder="Item Name"
                      value={row.item}
                      onChange={(e) =>
                        handleChange(index, "item", e.target.value)
                      }
                      className="w-40"
                    /> */}
                    <Popover
                      open={openStates[index] || false}
                      onOpenChange={(isOpen) => toggleOpenState(index, isOpen)}
                    >
                      <PopoverTrigger asChild>
                        
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openStates[index] || false}
                          className="w-[200px] justify-between text-ellipsis overflow-hidden whitespace-nowrap"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {row.item
                                  ? items.find(
                                      (item) => item.itemName === row.item
                                    )?.itemName || "Choose Items"
                                  : "Choose Items"}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {row.item
                                    ? ` ${
                                        items.find(
                                          (item) => item.itemName === row.item
                                        )?.itemName || "Choose Items"
                                      }`
                                    : "Please select an item"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Choose Item"
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No items !</CommandEmpty>
                            <CommandGroup>
                              {items.map((item, id) => (
                                <CommandItem
                                  key={id}
                                  value={item.itemName}
                                  onSelect={(currentValue) => {
                                    const selectedItem = items.find(
                                      (item) => item.itemName === currentValue
                                    );
                                    handleChange(index, "item", item.itemName);
                                    // handleChange(index, "hsn", selectedItem?.hsn);

                                    toggleOpenState(index, false); // Close combobox after selection
                                  }}
                                >
                                  {item.itemName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </th>
                  <td className="px-3 py-4">
                    <Input
                      placeholder="GST "
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
                      placeholder="Date"
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
                      placeholder="Description"
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
          className="my-4 w-20 flex items-center justify-center gap-2 px-2 py-2 bg-purple-500 text-white rounded shadow hover:bg-purple-300"
        >
          <MdAdd size={20} /> Add  
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
            <div className=" flex flex-col gap-2 ">
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
            <div className="flex flex-col gap-2 text-right">
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
      {params?.invoiceId === undefined ? (
        <Button onClick={previewInvoice}>Preview</Button>
      ) : (
        <Button onClick={previewInvoice}>Preview Updates</Button>
      )}
    </div>
  );
};

export default InvoiceForm;
