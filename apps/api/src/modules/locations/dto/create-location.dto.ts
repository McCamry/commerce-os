import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

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
}
