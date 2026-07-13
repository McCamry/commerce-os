import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreatePurchaseInvoiceItemDto } from './create-purchase-invoice.dto';

export class UpdatePurchaseInvoiceDto {
  @IsOptional()
  @IsString()
  invoiceNo?: string;

  @IsOptional()
  @IsString()
  invoiceDate?: string;

  @IsOptional()
  @IsString()
  dueDate?: string | null;

  @IsOptional()
  @IsNumber()
  vat?: number;

  @IsOptional()
  @IsString()
  status?: string;

  // When provided, existing items are fully replaced and totals recomputed.
  @IsOptional()
  @IsArray()
  items?: CreatePurchaseInvoiceItemDto[];
}
