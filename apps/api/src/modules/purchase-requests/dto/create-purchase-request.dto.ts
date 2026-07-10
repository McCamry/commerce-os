export class CreatePurchaseRequestItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  remark?: string;
}

export class CreatePurchaseRequestDto {
  organizationId!: string;
  storeId!: string;
  requestNo!: string;
  requestBy!: string;
  requestDate?: string;
  status?: string;
  remark?: string;
  items!: CreatePurchaseRequestItemDto[];
}
