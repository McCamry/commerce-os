import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuotationItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  unitPrice!: number;
  discount?: number;
  taxRate?: number;
}

export class CreateQuotationDto {
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  quotationNo!: string;

  @IsOptional()
  @IsString()
  quotationDate?: string;

  @IsOptional()
  @IsString()
  expireDate?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsArray()
  items!: CreateQuotationItemDto[];
}
