import {
  CreateVariantDto,
  CreateProductImageDto,
  CreateProductMarketplaceDto,
} from './create-product.dto';

export class UpdateProductDto {
  categoryId?: string;
  brandId?: string | null;
  unitId?: string;
  taxId?: string | null;
  code?: string;
  sku?: string | null;
  name?: string;
  shortName?: string | null;
  description?: string | null;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isActive?: boolean;
  isSerialized?: boolean;
  allowBackorder?: boolean;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  length?: number | null;
  slug?: string;
  metaTitle?: string | null;
  metaKeyword?: string | null;
  metaDescription?: string | null;

  variants?: CreateVariantDto[];
  images?: CreateProductImageDto[];
  marketplaceMappings?: CreateProductMarketplaceDto[];
}
