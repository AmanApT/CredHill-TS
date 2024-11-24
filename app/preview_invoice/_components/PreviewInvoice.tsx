"use client";

import { Button } from "@/components/ui/button";
import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const PreviewInvoice = () => {
  const { invoiceFormData, companyDetails, tableRows } = useInvoiceContext();
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

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const printInvoice = ()=>{
    reactToPrintFn();
  }
  return (
    <section ref={contentRef} className="p-4 bg-white rounded-md ">
      <h2 className="text-2xl text-[#6538BF] ">Invoice</h2>
      <div className="mt-4 flex gap-5 text-sm">
        <div className="text-gray-500 font-semibold flex flex-col gap-1">
          <p>Invoice No #</p>
          <p>Invoice Date</p>
          <p>Venue</p>
          <p>Approval ID</p>
          <p>Order Referred By</p>
        </div>
        <div className="flex flex-col font-semibold gap-1">
          <p>259</p>
          <p>Nov 20, 2024</p>
          <p>Hotel Golden Palm I.P. extension</p>
          <p>CDRMT1234</p>
          <p>Mr.Vedpal Singh</p>
        </div>
      </div>
      <section className="flex gap-4 mt-3 justify-between">
        <div className="flex w-[45vw] text-sm flex-col rounded-md p-3 bg-[#efebf8]">
          <p className="text-[#6538BF] text-lg">Billed By</p>
          <p className="font-bold">SHIVAM PROJECTION</p>
          <p>241,242 L . Extension ,</p>
          <p>Mohan Garden</p>
          <p>Delhi,India - 110059</p>
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
        <div className="flex w-[45vw] text-sm flex-col  rounded-md p-3 bg-[#efebf8]">
          <p className="text-[#6538BF] text-lg">Billed To</p>
          <p className="font-bold">SHIVAM PROJECTION</p>
          <p>241,242 L . Extension ,</p>
          <p>Mohan Garden</p>
          <p>Delhi,India - 110059</p>
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
              <th>CGST</th>
              <th>SGST</th>
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
                <td className="  p-2 py-3">
                  {idx + 1}
                </td>
                <td className="text-left">
                  <p>{row.item}</p>
                  <p className="text-[0.5rem]">(HSN/SAC: 997321)</p>
                </td>
                <td>{row.gstRate}</td>
                <td>{row.date}</td>
                <td className="break-words  whitespace-normal">{row.description}</td>
                <td className="">{row.quantity}</td>
                <td>{row.rate}</td>
                <td>{row.amount}</td>
                <td className="">{row.cgst}</td>
                <td className="">{row.sgst}</td>
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="flex justify-between">
          <div className="w-1/2  avoid-break">
            <div className="mt-4 font-semibold ">
              Total(in words): {numberToWords(3540)}
            </div>
            <div className="mt-4 rounded-md  p-2 bg-[#efebf8]">
              <p className="my-2  text-[#6538BF]">Bank Details</p>
              <div className="flex justify-between">
                <div className="font-semibold flex flex-col gap-1">
                  <p>Account Name</p>
                  <p>Account Number</p>
                  <p>IFSC</p>
                  <p>Account Type</p>
                  <p>Bank</p>
                </div>
                <div className="flex flex-col gap-1 ">
                  <p>Shivam Projection</p>
                  <p>026502000010632</p>
                  <p>IOBA0000265</p>
                  <p>Current</p>
                  <p>Indian Overseas Bank</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/3 pr-4">
            <div className="mt-4 flex justify-between ">
              <div className=" flex flex-col gap-2">
                <p>Amount</p>
                <p>CGST</p>
                <p>SGST</p>
              </div>
              <div className="flex flex-col gap-2 ">
                <p>₹3000</p>
                <p>₹270</p>
                <p>₹270</p>
              </div>
            </div>
            <hr className="mt-4 border border-black" />
            <div className="py-1 flex text-lg justify-between font-bold">
              <span>Total (INR)</span>
              <span>₹3,540</span>
            </div>
            <hr className="border border-black" />
            <div>{/* sign */}</div>
          </div>
        </section>
      </section>

      <Button onClick={printInvoice} className="no-print">
        Print
      </Button>
    </section>
  );
};

export default PreviewInvoice;
