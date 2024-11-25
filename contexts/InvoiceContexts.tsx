"use client"; // Ensure it's a client component for state management

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

export interface CompanyDetails {
  companyName: string;
  companyAddress: string;
  gst: string;
  email: string;
  phone: string;
  clientId?: string;
  pan?: string;
  city?: string;
  pincode?: string;
  contact?: string;
  logoUrl?: string;
  stampUrl?: string;
}

export interface TableRow {
  item: string;
  gstRate: number;
  hsn:string,
  date: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}
export interface InvoiceFormData {
  invoiceNo: string;
  venue: string;
  referredBy: string;
  date: string;
  approvalId: string;
}

export interface AccountInfo {
  bankName: string;
  email: string;
  ifsc: string;
  accountNo: string;
  branch: string;
}
export interface InvoiceContextType {
  invoiceFormData: InvoiceFormData;
  setInvoiceFormData: Dispatch<SetStateAction<InvoiceFormData>>;
  companyDetails: { billedBy: CompanyDetails; billedTo: CompanyDetails; accountInfo: AccountInfo };
  setCompanyDetails: Dispatch<SetStateAction<{
    billedBy: CompanyDetails;
    billedTo: CompanyDetails;
    accountInfo: AccountInfo;
  }>>;
  tableRows: TableRow[];
  setTableRows: Dispatch<SetStateAction<TableRow[]>>;
  includeBankDetails: boolean;
  setIncludeBankDetails: Dispatch<SetStateAction<boolean>>;
  invoices: [];
  setInvoices: Dispatch<SetStateAction<[]>>;
  setItems: Dispatch<SetStateAction<[]>>;
  items:[]
}
const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [invoiceFormData, setInvoiceFormData] = useState<InvoiceFormData>({
    invoiceNo: "",
    venue: "",
    referredBy: "",
    date: new Date().toISOString().split("T")[0],
    approvalId: "",
  });

  const [invoices, setInvoices] = useState<[]>();

  const [companyDetails, setCompanyDetails] = useState({
    billedBy: {
      companyName: "",
      email: "",
      gstin: "",
      pan: "",
      companyAddress: "",
      city: "",
      pincode: "",
      contact: "",
     
      logoUrl: "",
      stampUrl: "",
    },
    billedTo: {
      clientId: "",
      clientName: "",
      email: "",
      gst: "",
      pan: "",
      clientOf : "",
      add: "",
      city: "",
      pincode: "",
      contact: "",
    },
    accountInfo: {
      bankName: "",
      email: "",
      ifsc: "",
      accountNo: "",
      branch: "",
    },
  });


  const [tableRows, setTableRows] = useState<TableRow[]>([
    {
      item: "",
      hsn:"",
      gstRate: 18,
      date: new Date().toISOString().split("T")[0],
      description: "",
      quantity: 0,
      rate: 0,
      amount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
    },
  ]);

  const [includeBankDetails, setIncludeBankDetails] = useState<boolean>(false);
  const [items, setItems] = useState<[]>([]);
  return (
    <InvoiceContext.Provider
      value={{
        invoiceFormData,
        setInvoiceFormData,
        companyDetails,
        setCompanyDetails,
        tableRows,
        setTableRows,
        includeBankDetails,
        setIncludeBankDetails,
        invoices,
        setInvoices,
        items,
        setItems
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoiceContext must be used within an InvoiceProvider");
  }
  return context;
};
