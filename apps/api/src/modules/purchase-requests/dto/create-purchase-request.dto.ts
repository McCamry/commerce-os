import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePurchaseRequestItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  remark?: string;
}

export class CreatePurchaseRequestDto {
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsString()
  @IsNotEmpty()
  requestNo!: string;

  @IsString()
  @IsNotEmpty()
  requestBy!: string;

  @IsOptional()
  @IsString()
  requestDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsArray()
  items!: CreatePurchaseRequestItemDto[];
}
