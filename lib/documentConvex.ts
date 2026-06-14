/**
 * Resolves the right Convex query/mutation references for the shared
 * quotation/proforma components. Keeps the api coupling in one place so the
 * generic DocumentForm/Preview/List don't hardcode a namespace.
 */
import { api } from "@/convex/_generated/api";

export const DOC_CONVEX = {
  quotation: {
    list: api.functions.quotation.getQuotations,
    add: api.functions.quotation.addQuotation,
    update: api.functions.quotation.updateQuotation,
    updateStatus: api.functions.quotation.updateQuotationStatus,
    remove: api.functions.quotation.deleteQuotation,
  },
  proforma: {
    list: api.functions.proforma.getProformas,
    add: api.functions.proforma.addProforma,
    update: api.functions.proforma.updateProforma,
    updateStatus: api.functions.proforma.updateProformaStatus,
    remove: api.functions.proforma.deleteProforma,
  },
} as const;

export const CONVERSION_CONVEX = {
  quotationToProforma: api.functions.conversion.convertQuotationToProforma,
  quotationToInvoice: api.functions.conversion.convertQuotationToInvoice,
  proformaToInvoice: api.functions.conversion.convertProformaToInvoice,
  deleteInvoiceWithUnlink: api.functions.conversion.deleteInvoiceWithUnlink,
};
