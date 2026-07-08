import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  Min,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class StockAdjustmentItemDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsInt()
  @Min(0)
  countQty: number;
}

export class CreateStockAdjustmentDto {
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockAdjustmentItemDto)
  items: StockAdjustmentItemDto[];
}
