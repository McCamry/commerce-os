import { IsArray, IsOptional, IsString } from 'class-validator';
import { CreateQuotationItemDto } from './create-quotation.dto';

export class UpdateQuotationDto {
  @IsOptional()
  @IsString()
  quotationDate?: string;

  @IsOptional()
  @IsString()
  expireDate?: string | null;

  @IsOptional()
  @IsString()
  remark?: string | null;

  @IsOptional()
  @IsString()
  status?: string;

  // When provided, the existing line items are fully replaced and totals recalculated.
  @IsOptional()
  @IsArray()
  items?: CreateQuotationItemDto[];
}
