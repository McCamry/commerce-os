import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSalesReturnItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  reason?: string;
}

export class CreateSalesReturnDto {
  @IsString()
  @IsNotEmpty()
  salesOrderId!: string;

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
  items!: CreateSalesReturnItemDto[];
}
