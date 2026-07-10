import { CreatePurchaseInvoiceItemDto } from './create-purchase-invoice.dto';

export class UpdatePurchaseInvoiceDto {
  invoiceNo?: string;
  invoiceDate?: string;
  dueDate?: string | null;
  vat?: number;
  status?: string;
  // When provided, existing items are fully replaced and totals recomputed.
  items?: CreatePurchaseInvoiceItemDto[];
}
