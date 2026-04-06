/**
 * Date utility functions for filtering invoices by date range
 */

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type FilterType = "week" | "month" | "all" | "custom";

/**
 * Get date range based on filter type
 */
export function getDateRange(filterType: FilterType, customStart?: Date, customEnd?: Date): DateRange {
  const endDate = new Date();
  let startDate = new Date();

  switch (filterType) {
    case "week":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case "custom":
      if (!customStart || !customEnd) {
        throw new Error("Custom date range requires both start and end dates");
      }
      return {
        startDate: customStart,
        endDate: customEnd,
      };
    case "all":
      startDate = new Date("1970-01-01");
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 1);
  }

  return { startDate, endDate };
}

/**
 * Filter invoices by date range
 */
export function filterInvoicesByDateRange(
  invoices: any[],
  dateRange: DateRange
): any[] {
  if (!invoices || invoices.length === 0) {
    return [];
  }

  return invoices.filter((invoice) => {
    if (!invoice.date) return false;
    const invoiceDate = new Date(invoice.date);
    return invoiceDate >= dateRange.startDate && invoiceDate <= dateRange.endDate;
  });
}

/**
 * Format date for input (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get display text for filter type
 */
export function getFilterDisplayText(filterType: FilterType): string {
  const textMap: Record<FilterType, string> = {
    week: "Past 1 Week",
    month: "Past 1 Month",
    all: "All Time",
    custom: "Custom Range",
  };
  return textMap[filterType];
}
