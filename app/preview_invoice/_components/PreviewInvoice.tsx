"use client";

import { Button } from "@/components/ui/button";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useMutation } from "convex/react";
import Image from "next/image";

import { useParams } from "next/navigation";

import { useRef} from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

const PreviewInvoice = () => {
  const { invoiceFormData, companyDetails, tableRows, includeBankDetails , items} =
    useInvoiceContext();
  const params = useParams<{
    invoiceId: string;
    tag: string;
    item: string;
  }>();

  const numberToWords = (amount: number) => {
    const singleDigits = [
      "",
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
    ];
    const twoDigits = [
      "",
      "",
      "TWENTY",
      "THIRTY",
      "FORTY",
      "FIFTY",
      "SIXTY",
      "SEVENTY",
      "EIGHTY",
      "NINETY",
    ];
    const teens = [
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ];
    const placeValues = ["", "THOUSAND", "LAKH", "CRORE"];

    function convertToWords(num) {
      let words = "";

      if (num >= 1000) {
        let thousands = Math.floor(num / 1000);
        words += `${convertToWords(thousands)} THOUSAND `;
        num %= 1000;
      }
      if (num >= 100) {
        let hundreds = Math.floor(num / 100);
        words += `${singleDigits[hundreds]} HUNDRED `;
        num %= 100;
      }
      if (num > 10 && num < 20) {
        words += `${teens[num - 11]} `;
      } else if (num >= 20 || num === 10) {
        let tens = Math.floor(num / 10);
        words += `${twoDigits[tens]} `;
        num %= 10;
      }
      if (num > 0 && num <= 9) {
        words += `${singleDigits[num]} `;
      }

      return words.trim();
    }

    const integerPart = Math.floor(amount);
    let words = convertToWords(integerPart).trim();

    return words ? `${words} RUPEES ONLY` : "ZERO RUPEES ONLY";
  };
  const { user } = useKindeBrowserClient();
  const addInvoice = useMutation(api.functions.invoice.addInvoice);
  const updateInvoiceData = useMutation(api.functions.invoice.updateInvoice);
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
  // console.log(companyDetails, "company");
  const getHsn = (item: string) => {
    const newItem = items.find((eachItem) => eachItem.itemName === item);
    console.log(newItem);
  
    // Return newItem.hsn if the item is found, otherwise return a fallback value
    return newItem ? newItem.hsn : ""; // or "" if you prefer an empty string
  };
  
  const { amount, cgst, sgst, total, igst } = calculateTotalSums();
  const saveInvoice = async () => {
    await addInvoice({
      invoiceNo: invoiceFormData?.invoiceNo,
      venue: invoiceFormData?.venue,
      approvalId: invoiceFormData?.approvalId,
      date: invoiceFormData?.date,
      ref: invoiceFormData?.referredBy,
      billedBy: user?.email,
      clientId: companyDetails?.billedTo?._id,
      totalAmount: total.toString(),
      tax: (cgst + sgst + igst).toString(),
      invoiceStatus: false,
      item: JSON.stringify(tableRows),
    });

    toast("Invoice Saved!");
    // router.push('/dashboard')
  };
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const printInvoice = () => {
    reactToPrintFn();
  };
  const updateInvoice = async () => {
    updateInvoiceData({
      _id: params?.invoiceId,
      invoiceNo: invoiceFormData?.invoiceNo,
      venue: invoiceFormData?.venue,
      approvalId: invoiceFormData?.approvalId,
      date: invoiceFormData?.date,
      ref: invoiceFormData?.referredBy,
      billedBy: user?.email,
      clientId: companyDetails?.billedTo?._id,
      totalAmount: total.toString(),
      tax: (cgst + sgst + igst).toString(),
      invoiceStatus: false,
      item: JSON.stringify(tableRows),
    });

    toast("Invoice Updated!");
    // router.push('/dashboard')
  };

  return (
    <section ref={contentRef} className="p-4 bg-white rounded-md ">
      <h2 className="text-2xl text-[#6538BF] ">Invoice</h2>
      <div className="mt-4 flex gap-5 text-sm">
        <div className="text-gray-500 font-semibold flex flex-col gap-1">
          <p>Invoice No #</p>
          <p>Invoice Date</p>
          {invoiceFormData?.venue && <p>Venue</p>}
          {invoiceFormData?.approvalId && <p>Approval ID</p>}
          {invoiceFormData?.referredBy && <p>Order Reffered By</p>}
        </div>
        <div className="flex flex-col font-semibold gap-1">
          <p>{invoiceFormData?.invoiceNo}</p>
          <p>{invoiceFormData?.date}</p>
          {invoiceFormData?.venue && <p>{invoiceFormData?.venue}</p>}
          {invoiceFormData?.approvalId && <p>{invoiceFormData?.approvalId}</p>}
          {invoiceFormData?.referredBy && <p>{invoiceFormData?.referredBy}</p>}
        </div>
      </div>
      <section className="flex gap-4 mt-3 justify-between">
        <div className="flex w-[45vw] text-sm flex-col rounded-md p-3 bg-[#efebf8]">
          <p className="text-[#6538BF] text-lg">Billed By</p>
          <p className="font-bold">
            {companyDetails?.billedBy.companyName.toUpperCase()}
          </p>
          {companyDetails?.billedBy.add && (
            <p>{companyDetails?.billedBy.add}</p>
          )}

          <p>
            {companyDetails?.billedBy.city} {companyDetails?.billedBy.pincode}
          </p>
          {companyDetails?.billedBy.gst && (
            <div>
              <span className="font-bold">GSTIN:</span>
              <span>{companyDetails?.billedBy.gst}</span>
            </div>
          )}
          {companyDetails?.billedBy.email && (
            <div>
              <span className="font-bold">Email:</span>
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
        <div className="flex w-[45vw] text-sm flex-col  rounded-md p-3 bg-[#efebf8]">
          <p className="text-[#6538BF] text-lg">Billed To</p>
          <p className="font-bold">
            {companyDetails?.billedTo.clientName.toUpperCase()}
          </p>
          {companyDetails?.billedTo.add && (
            <p>{companyDetails?.billedTo.add}</p>
          )}

          <p>
            {companyDetails?.billedTo.city} {companyDetails?.billedTo.pincode}
          </p>
          {companyDetails?.billedTo.gst && (
            <div>
              <span className="font-bold">GSTIN: </span>
              <span>{companyDetails?.billedTo.gst} </span>
            </div>
          )}
          {companyDetails?.billedTo.email && (
            <div>
              <span className="font-bold">Email: </span>
              <span>{companyDetails?.billedTo.email} </span>
            </div>
          )}
          {companyDetails?.billedTo.contact && (
            <div>
              <span className="font-bold">Phone: </span>
              <span>{companyDetails?.billedTo.contact} </span>
            </div>
          )}
        </div>
      </section>

      <section>
        <table className="w-full mt-6 ">
          <thead className="bg-[#6538BF]  text-white ">
            <tr className="text-sm">
              <th className="rounded-tl-md "></th>
              <th id="itemCol" className="text-left p-2  ">
                Item
              </th>
              <th>GST Rate</th>
              <th>Date</th>
              <th className="w-40">Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
              {companyDetails?.billedTo?.gst?.substring(0, 2) == "07" ? (
                <>
                  <th>CGST</th>
                  <th>SGST</th>
                </>
              ) : (
                <th>IGST</th>
              )}

              <th className="rounded-tr-md">Total</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, idx) => (
              <tr
                className={`text-center  text-sm ${
                  idx % 2 !== 0 ? "bg-white" : "bg-[#efebf8]"
                }`}
                key={idx}
              >
                <td className="  p-2 py-3">{idx + 1}</td>
                <td className="text-left">
                  <p>{row.item}</p>
                  <p className="text-[0.5rem]">HSN/SAC: {getHsn(row.item)}</p>
                </td>
                <td>{row.gstRate}</td>
                <td>{row.date}</td>
                <td className="break-words  whitespace-normal">
                  {row.description}
                </td>
                <td className="">{row.quantity}</td>
                <td>{row.rate}</td>
                <td>{row.amount}</td>
                {companyDetails?.billedTo?.gst?.substring(0, 2) == "07" ? (
                  <>
                    {" "}
                    <td className="">{row.cgst}</td>
                    <td className="">{row.sgst}</td>
                  </>
                ) : (
                  <td>{row.igst}</td>
                )}

                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="flex justify-between h-60 ">
          <div className="w-1/2  avoid-break">
            <div className="mt-4 font-semibold ">
              Total(in words): {numberToWords(total)}
            </div>
            {includeBankDetails && (
              <div className="mt-4 rounded-md  p-2 bg-[#efebf8]">
                <p className="my-2  text-[#6538BF]">Bank Details</p>
                <div className="flex justify-between">
                  <div className="font-semibold flex flex-col gap-1">
                    <p>Account Name</p>
                    <p>Account Number</p>
                    <p>IFSC</p>
                    {/* <p>Account Type</p> */}
                    <p>Bank</p>
                  </div>
                  <div className="flex flex-col gap-1 ">
                    <p>{companyDetails?.billedBy?.companyName}</p>
                    <p>{companyDetails?.accountInfo?.accountNo}</p>
                    <p>{companyDetails?.accountInfo?.ifsc}</p>

                    {/* <p>Current</p> */}
                    <p>{companyDetails?.accountInfo?.bankName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
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
            <div>
              {" "}
              {companyDetails?.billedBy?.stampUrl && (
                <div className=" avoid-break ">
                  <Image
                    className=""
                    width={120}
                    height={120}
                    alt="Company Stamp"
                    src={companyDetails?.billedBy?.stampUrl}
                  ></Image>
                </div>
              )}
            </div>
          </div>
        </section>
      </section>

      <div className="flex justify-between avoid-break">
        <div className="gap-5 flex mt-5">
          <Button onClick={printInvoice} className="no-print">
            Print
          </Button>
          {params?.invoiceId === undefined ? (
            <Button onClick={saveInvoice} className="no-print">
              Save Invoice
            </Button>
          ) : (
            <Button onClick={updateInvoice} className="no-print">
              Update Invoice
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PreviewInvoice;
