export class CreateSalesInvoiceItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  unitPrice!: number;
}

export class CreateSalesInvoiceDto {
  salesOrderId!: string;
  invoiceNo!: string;
  invoiceDate?: string;
  vat?: number;
  items!: CreateSalesInvoiceItemDto[];
}
