import { CreateSalesInvoiceItemDto } from './create-sales-invoice.dto';

export class UpdateSalesInvoiceDto {
  invoiceNo?: string;
  invoiceDate?: string;
  vat?: number;
  status?: string;
  // When provided, existing items are fully replaced and totals recomputed.
  items?: CreateSalesInvoiceItemDto[];
}
