export class CreateProductDto {
  organizationId!: string;
  categoryId!: string;
  brandId?: string;
  unitId!: string;
  taxId?: string;
  code!: string;
  sku?: string;
  name!: string;
  shortName?: string;
  description?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isActive?: boolean;
  isSerialized?: boolean;
  allowBackorder?: boolean;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  slug!: string;
  metaTitle?: string;
  metaKeyword?: string;
  metaDescription?: string;

  variants?: CreateVariantDto[];
  images?: CreateProductImageDto[];
  marketplaceMappings?: CreateProductMarketplaceDto[];
}

export class CreateVariantDto {
  sku!: string;
  name!: string;
  weight?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  barcodes?: CreateBarcodeDto[];
  prices?: CreatePriceDto[];
  attributeValueIds?: string[]; // IDs of attribute values (e.g. Black, 128GB)
  marketplaceMappings?: CreateProductMarketplaceDto[];
}

export class CreateBarcodeDto {
  barcode!: string;
  isDefault?: boolean;
}

export class CreatePriceDto {
  priceType!: string; // Retail, Wholesale, Member, VIP, Marketplace
  currency?: string; // Defaults to THB
  price!: number;
  startDate?: string; // ISO String
  endDate?: string; // ISO String
}

export class CreateProductImageDto {
  url!: string;
  sortOrder?: number;
  altText?: string;
}

export class CreateProductMarketplaceDto {
  marketplace!: 'SHOPEE' | 'LAZADA' | 'TIKTOK' | 'WEBSITE';
  externalProductId!: string;
  externalVariantId?: string;
}
