import { IsArray, IsOptional, IsString } from 'class-validator';
import { CreateSalesReturnItemDto } from './create-sales-return.dto';

export class UpdateSalesReturnDto {
  @IsOptional()
  @IsString()
  returnNo?: string;

  @IsOptional()
  @IsString()
  returnDate?: string;

  @IsOptional()
  @IsString()
  reason?: string | null;

  @IsOptional()
  @IsString()
  status?: string;

  // When provided, existing items are fully replaced.
  @IsOptional()
  @IsArray()
  items?: CreateSalesReturnItemDto[];
}
