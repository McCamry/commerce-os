import { IsArray, IsOptional, IsString } from 'class-validator';
import { CreatePurchaseRequestItemDto } from './create-purchase-request.dto';

export class UpdatePurchaseRequestDto {
  @IsOptional()
  @IsString()
  requestBy?: string;

  @IsOptional()
  @IsString()
  requestDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string | null;

  // When provided, existing items are fully replaced.
  @IsOptional()
  @IsArray()
  items?: CreatePurchaseRequestItemDto[];
}
