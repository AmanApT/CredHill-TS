"use client";

import { useInvoiceContext } from "@/contexts/InvoiceContexts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { filterInvoicesByDateRange, DateRange, getDateRange } from "@/lib/dateUtils";
import { formatIndianNumber } from "@/lib/invoiceUtils";

interface InvoiceSummaryCardsProps {
  dateRange: DateRange;
}

export function InvoiceSummaryCards({ dateRange }: InvoiceSummaryCardsProps) {
  const { invoices } = useInvoiceContext();

  // Calculate metrics for current period
  const filteredInvoices = filterInvoicesByDateRange(invoices || [], dateRange);

  const totalInvoices = filteredInvoices.length;

  const paymentReceived = filteredInvoices.reduce((sum, invoice: any) => {
    if (invoice?.invoiceStatus === true) {
      return sum + parseFloat(invoice?.totalAmount || 0);
    }
    return sum;
  }, 0);

  const totalRevenue = filteredInvoices.reduce((sum, invoice: any) => {
    return sum + parseFloat(invoice?.totalAmount || 0);
  }, 0);

  const pendingPayment = filteredInvoices.reduce((sum, invoice: any) => {
    if (invoice?.invoiceStatus === false) {
      return sum + parseFloat(invoice?.totalAmount || 0);
    }
    return sum;
  }, 0);

  const totalTax = filteredInvoices.reduce((sum, invoice: any) => {
    return sum + parseFloat(invoice?.tax || 0);
  }, 0);

  // Calculate metrics for previous period
  const getPreviousPeriodDateRange = () => {
    const currentStart = dateRange.startDate;
    const currentEnd = dateRange.endDate;
    const periodLength = currentEnd.getTime() - currentStart.getTime();

    const prevEnd = new Date(currentStart);
    prevEnd.setTime(prevEnd.getTime() - 1); // Go back 1 day to end of previous period

    const prevStart = new Date(prevEnd);
    prevStart.setTime(prevStart.getTime() - periodLength);

    return { startDate: prevStart, endDate: prevEnd };
  };

  const previousPeriod = getPreviousPeriodDateRange();
  const previousFilteredInvoices = filterInvoicesByDateRange(invoices || [], previousPeriod);

  const prevTotalInvoices = previousFilteredInvoices.length;
  const prevPaymentReceived = previousFilteredInvoices.reduce((sum, invoice: any) => {
    if (invoice?.invoiceStatus === true) {
      return sum + parseFloat(invoice?.totalAmount || 0);
    }
    return sum;
  }, 0);

  const prevTotalRevenue = previousFilteredInvoices.reduce((sum, invoice: any) => {
    return sum + parseFloat(invoice?.totalAmount || 0);
  }, 0);

  const prevTotalTax = previousFilteredInvoices.reduce((sum, invoice: any) => {
    return sum + parseFloat(invoice?.tax || 0);
  }, 0);

  // Calculate percentage changes
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const invoiceChangePercent = getPercentageChange(totalInvoices, prevTotalInvoices);
  const paymentChangePercent = getPercentageChange(paymentReceived, prevPaymentReceived);
  const revenueChangePercent = getPercentageChange(totalRevenue, prevTotalRevenue);
  const taxChangePercent = getPercentageChange(totalTax, prevTotalTax);

  const metrics = [
    {
      title: "Total Invoices",
      value: totalInvoices,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      changePercent: invoiceChangePercent,
    },
    {
      title: "Payment Received",
      value: `₹${formatIndianNumber(paymentReceived)}`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      changePercent: paymentChangePercent,
    },
    {
      title: "Total Revenue",
      value: `₹${formatIndianNumber(totalRevenue)}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      changePercent: revenueChangePercent,
    },
    {
      title: "Total Tax",
      value: `₹${formatIndianNumber(totalTax)}`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      changePercent: taxChangePercent,
    },
    {
      title: "Pending Payment",
      value: `₹${formatIndianNumber(pendingPayment)}`,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      changePercent: 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = parseFloat(metric.changePercent as string) >= 0;

        return (
          <Card key={index} className="border-0 shadow-md">
            <CardHeader className={`pb-3 ${metric.bgColor}`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              {metric.changePercent !== 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp
                    className={`h-4 w-4 ${
                      isPositive ? "text-green-600" : "text-red-600"
                    } ${isPositive ? "" : "transform rotate-180"}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}{metric.changePercent}% vs last period
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
