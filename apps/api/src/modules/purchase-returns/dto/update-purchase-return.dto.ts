import { IsArray, IsOptional, IsString } from 'class-validator';
import { CreatePurchaseReturnItemDto } from './create-purchase-return.dto';

export class UpdatePurchaseReturnDto {
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
  items?: CreatePurchaseReturnItemDto[];
}
