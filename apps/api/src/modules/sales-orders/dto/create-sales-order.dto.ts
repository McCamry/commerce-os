import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSalesOrderItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  unitPrice!: number;
  discount?: number;
  taxRate?: number;
}

export class CreateSalesOrderDto {
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsString()
  @IsNotEmpty()
  orderNo!: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  vat?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  shippingFee?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsArray()
  items!: CreateSalesOrderItemDto[];
}
