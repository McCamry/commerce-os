import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReceiptDto {
  @IsOptional()
  @IsString()
  receiptNo?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  reference?: string | null;

  @IsOptional()
  @IsString()
  status?: string;
}
