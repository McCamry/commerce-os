import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSalesInvoiceItemDto {
  variantId!: string;
  unitId!: string;
  quantity!: number;
  unitPrice!: number;
}

export class CreateSalesInvoiceDto {
  @IsString()
  @IsNotEmpty()
  salesOrderId!: string;

  @IsString()
  @IsNotEmpty()
  invoiceNo!: string;

  @IsOptional()
  @IsString()
  invoiceDate?: string;

  @IsOptional()
  @IsNumber()
  vat?: number;

  @IsArray()
  items!: CreateSalesInvoiceItemDto[];
}
