import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  defaultStoreId?: string;

  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  storeIds?: string[];
}
