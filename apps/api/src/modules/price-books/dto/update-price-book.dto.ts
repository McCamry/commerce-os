import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { CreatePriceBookItemDto } from './create-price-book.dto';

export class UpdatePriceBookDto {
  @IsOptional()
  @IsString()
  customerGroupId?: string | null;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  effectiveDate?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string | null;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  // When provided, existing items are fully replaced.
  @IsOptional()
  @IsArray()
  items?: CreatePriceBookItemDto[];
}
