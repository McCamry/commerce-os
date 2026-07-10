export class CreatePurchaseInvoiceItemDto {
  variantId!: string;
  unitId!: string;
  description?: string;
  quantity!: number;
  unitPrice!: number;
}

export class CreatePurchaseInvoiceDto {
  vendorId!: string;
  purchaseOrderId?: string;
  invoiceNo!: string;
  invoiceDate!: string;
  dueDate?: string;
  vat?: number;
  items!: CreatePurchaseInvoiceItemDto[];
}
