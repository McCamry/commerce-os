import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateSalesInvoiceItemDto } from './create-sales-invoice.dto';

export class UpdateSalesInvoiceDto {
  @IsOptional()
  @IsString()
  invoiceNo?: string;

  @IsOptional()
  @IsString()
  invoiceDate?: string;

  @IsOptional()
  @IsNumber()
  vat?: number;

  @IsOptional()
  @IsString()
  status?: string;

  // When provided, existing items are fully replaced and totals recomputed.
  @IsOptional()
  @IsArray()
  items?: CreateSalesInvoiceItemDto[];
}
