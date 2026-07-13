import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateGoodsReceiveItemDto {
  purchaseOrderItemId?: string;
  variantId!: string;
  unitId!: string;
  locationId!: string;
  quantity!: number;
  lotNumber?: string;
  serialNumber?: string;
  manufactureDate?: string;
  expireDate?: string;
}

export class CreateGoodsReceiveDto {
  @IsString()
  @IsNotEmpty()
  purchaseOrderId!: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsString()
  @IsNotEmpty()
  receiveNo!: string;

  @IsArray()
  items!: CreateGoodsReceiveItemDto[];
}
