import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePurchaseInvoiceItemDto {
  variantId!: string;
  unitId!: string;
  description?: string;
  quantity!: number;
  unitPrice!: number;
}

export class CreatePurchaseInvoiceDto {
  @IsString()
  @IsNotEmpty()
  vendorId!: string;

  @IsOptional()
  @IsString()
  purchaseOrderId?: string;

  @IsString()
  @IsNotEmpty()
  invoiceNo!: string;

  @IsString()
  @IsNotEmpty()
  invoiceDate!: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  vat?: number;

  @IsArray()
  items!: CreatePurchaseInvoiceItemDto[];
}
