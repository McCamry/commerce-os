export class CreateSalesReturnItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  reason?: string;
}

export class CreateSalesReturnDto {
  salesOrderId!: string;
  returnNo!: string;
  returnDate?: string;
  reason?: string;
  status?: string;
  items!: CreateSalesReturnItemDto[];
}
