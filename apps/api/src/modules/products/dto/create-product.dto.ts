import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsString()
  @IsNotEmpty()
  unitId!: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isSerialized?: boolean;

  @IsOptional()
  @IsBoolean()
  allowBackorder?: boolean;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaKeyword?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  variants?: CreateVariantDto[];

  @IsOptional()
  @IsArray()
  images?: CreateProductImageDto[];

  @IsOptional()
  @IsArray()
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
