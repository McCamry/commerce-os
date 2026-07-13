import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  logo?: string | null;

  @IsOptional()
  @IsString()
  website?: string | null;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
