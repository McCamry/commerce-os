import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePurchaseReturnItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  reason?: string;
}

export class CreatePurchaseReturnDto {
  @IsString()
  @IsNotEmpty()
  vendorId!: string;

  @IsString()
  @IsNotEmpty()
  returnNo!: string;

  @IsOptional()
  @IsString()
  returnDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsArray()
  items!: CreatePurchaseReturnItemDto[];
}
