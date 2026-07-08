import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateWarehouseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}
