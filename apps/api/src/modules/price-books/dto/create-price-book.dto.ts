export class CreatePriceBookItemDto {
  variantId!: string;
  price!: number;
  minQuantity?: number;
}

export class CreatePriceBookDto {
  organizationId!: string;
  customerGroupId?: string;
  code!: string;
  name!: string;
  description?: string;
  currency?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  items?: CreatePriceBookItemDto[];
}
