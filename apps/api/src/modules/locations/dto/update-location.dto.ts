import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  allowPicking?: boolean;

  @IsBoolean()
  @IsOptional()
  allowReceiving?: boolean;

  @IsNumber()
  @IsOptional()
  maxCapacity?: number;

  @IsNumber()
  @IsOptional()
  pickingRouteOrder?: number;

  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}
