import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class StockTransferItemDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsString()
  @IsNotEmpty()
  fromLocationId: string;

  @IsString()
  @IsNotEmpty()
  toLocationId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateStockTransferDto {
  @IsString()
  @IsNotEmpty()
  fromWarehouseId: string;

  @IsString()
  @IsNotEmpty()
  toWarehouseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  items: StockTransferItemDto[];
}
