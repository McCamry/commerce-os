import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePurchaseOrderItemDto {
  variantId!: string;
  unitId!: string;
  description?: string;
  quantity!: number;
  unitPrice!: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsString()
  @IsNotEmpty()
  vendorId!: string;

  @IsOptional()
  @IsString()
  purchaseRequestId?: string;

  @IsString()
  @IsNotEmpty()
  purchaseNo!: string;

  @IsOptional()
  @IsString()
  expectedDate?: string;

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
  shippingCost?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsArray()
  items!: CreatePurchaseOrderItemDto[];
}
