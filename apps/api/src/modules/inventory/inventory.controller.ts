import { Controller, Get, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findLevels(
    @Query('warehouseId') warehouseId?: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.inventoryService.findLevels(warehouseId, variantId);
  }

  @Get('variant/:variantId')
  findByVariant(@Param('variantId') variantId: string) {
    return this.inventoryService.findByVariant(variantId);
  }
}
