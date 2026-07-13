import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShipmentItemDto {
  salesOrderItemId!: string;
  quantity!: number;
}

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  salesOrderId!: string;

  @IsString()
  @IsNotEmpty()
  shipmentNo!: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsString()
  trackingNo?: string;

  @IsArray()
  items!: CreateShipmentItemDto[];
}
