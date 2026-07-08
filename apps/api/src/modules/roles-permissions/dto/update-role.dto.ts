import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}
