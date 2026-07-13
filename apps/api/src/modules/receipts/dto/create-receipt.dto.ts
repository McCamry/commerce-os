import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReceiptDto {
  @IsString()
  @IsNotEmpty()
  salesInvoiceId!: string;

  @IsString()
  @IsNotEmpty()
  receiptNo!: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
