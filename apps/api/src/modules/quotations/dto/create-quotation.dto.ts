export class CreateQuotationItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  unitPrice!: number;
  discount?: number;
  taxRate?: number;
}

export class CreateQuotationDto {
  organizationId!: string;
  storeId!: string;
  customerId!: string;
  quotationNo!: string;
  quotationDate?: string;
  expireDate?: string;
  remark?: string;
  status?: string;
  items!: CreateQuotationItemDto[];
}
