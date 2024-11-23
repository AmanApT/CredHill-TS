'use client'; // Ensure it's a client component for state management

import { createContext, useContext, useState, ReactNode } from 'react';

export interface CompanyDetails {
  companyName: string;
  companyAddress: string;
  gstin: string;
  email: string;
  phone: string;
}

export interface TableRow {
  item: string;
  gstRate: number;
  date: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  cgst: number;
  sgst: number;
  total: number;
}

export interface InvoiceFormData {
  invoiceNo: string;
  venue: string;
  referredBy: string;
  date: string;
  approvalId: string;
}

export interface InvoiceContextType {
  invoiceFormData: InvoiceFormData;
  setInvoiceFormData: (data: InvoiceFormData) => void;
  companyDetails: { billedBy: CompanyDetails; billedTo: CompanyDetails };
  setCompanyDetails: (data: { billedBy: CompanyDetails; billedTo: CompanyDetails }) => void;
  tableRows: TableRow[];
  setTableRows: (rows: TableRow[]) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [invoiceFormData, setInvoiceFormData] = useState<InvoiceFormData>({
    invoiceNo: '',
    venue: '',
    referredBy: '',
    date: new Date().toISOString().split('T')[0],
    approvalId:'' // Default to current date
  });

  const [companyDetails, setCompanyDetails] = useState({
    billedBy: {
      companyName: '',
      companyAddress: '',
      gstin: '',
      email: '',
      phone: '',
    },
    billedTo: {
      companyName: '',
      companyAddress: '',
      gstin: '',
      email: '',
      phone: '',
    },
  });

  const [tableRows, setTableRows] = useState<TableRow[]>([
    // Initial empty row as an example
    {
      item: '',
      gstRate: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      quantity: 0,
      rate: 0,
      amount: 0,
      cgst: 0,
      sgst: 0,
      total: 0,
    },
  ]);

  return (
    <InvoiceContext.Provider
      value={{
        invoiceFormData,
        setInvoiceFormData,
        companyDetails,
        setCompanyDetails,
        tableRows,
        setTableRows,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoiceContext must be used within an InvoiceProvider');
  }
  return context;
};
