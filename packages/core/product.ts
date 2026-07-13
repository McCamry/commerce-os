export type ProductCategoryID = string;
export type BrandID = string;
export type UnitID = string;
export type TaxID = string;
export type ProductID = string;
export type ProductVariantID = string;
export type ProductBarcodeID = string;
export type ProductPriceID = string;
export type ProductImageID = string;
export type AttributeID = string;
export type AttributeValueID = string;
export type ProductMarketplaceID = string;

export interface ProductCategory {
  id: ProductCategoryID;
  organizationId: string;
  parentId?: string | null;
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: BrandID;
  organizationId: string;
  code: string;
  name: string;
  logo?: string | null;
  website?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: UnitID;
  organizationId: string;
  code: string;
  name: string;
  symbol: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

export interface Tax {
  id: TaxID;
  organizationId: string;
  code: string;
  name: string;
  rate: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: ProductID;
  organizationId: string;
  categoryId: string;
  brandId?: string | null;
  unitId: string;
  taxId?: string | null;
  code: string;
  sku?: string | null;
  name: string;
  shortName?: string | null;
  description?: string | null;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
  isActive: boolean;
  isSerialized: boolean;
  allowBackorder: boolean;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;
  slug: string;
  metaTitle?: string | null;
  metaKeyword?: string | null;
  metaDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: ProductVariantID;
  productId: string;
  sku: string;
  name: string;
  weight?: number | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBarcode {
  id: ProductBarcodeID;
  variantId: string;
  barcode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductPrice {
  id: ProductPriceID;
  variantId: string;
  priceType: string;
  currency: string;
  price: number;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: ProductImageID;
  productId: string;
  url: string;
  sortOrder: number;
  altText?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attribute {
  id: AttributeID;
  organizationId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttributeValue {
  id: AttributeValueID;
  attributeId: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductMarketplace {
  id: ProductMarketplaceID;
  productId?: string | null;
  variantId?: string | null;
  marketplace: "SHOPEE" | "LAZADA" | "TIKTOK" | "WEBSITE";
  externalProductId: string;
  externalVariantId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}