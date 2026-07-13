import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CreateVariantDto,
  CreateProductImageDto,
  CreateProductMarketplaceDto,
} from './create-product.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  brandId?: string | null;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsString()
  taxId?: string | null;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  sku?: string | null;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  shortName?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

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
  weight?: number | null;

  @IsOptional()
  @IsNumber()
  width?: number | null;

  @IsOptional()
  @IsNumber()
  height?: number | null;

  @IsOptional()
  @IsNumber()
  length?: number | null;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string | null;

  @IsOptional()
  @IsString()
  metaKeyword?: string | null;

  @IsOptional()
  @IsString()
  metaDescription?: string | null;

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
