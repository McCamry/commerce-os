import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  customerGroupId?: string | null;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  taxId?: string | null;

  @IsOptional()
  @IsString()
  branch?: string | null;

  @IsOptional()
  @IsString()
  contactPerson?: string | null;

  @IsOptional()
  @IsString()
  phone1?: string | null;

  @IsOptional()
  @IsString()
  phone2?: string | null;

  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @IsNumber()
  creditDays?: number;

  @IsOptional()
  @IsNumber()
  creditLimit?: number | null;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
