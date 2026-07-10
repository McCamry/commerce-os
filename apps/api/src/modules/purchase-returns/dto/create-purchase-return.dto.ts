export class CreatePurchaseReturnItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  reason?: string;
}

export class CreatePurchaseReturnDto {
  vendorId!: string;
  returnNo!: string;
  returnDate?: string;
  reason?: string;
  status?: string;
  items!: CreatePurchaseReturnItemDto[];
}
