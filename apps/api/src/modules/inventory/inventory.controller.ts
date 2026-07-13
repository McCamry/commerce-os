import { Controller, Get, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findLevels(
    @CurrentUser('organizationId') organizationId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.inventoryService.findLevels(
      organizationId,
      warehouseId,
      variantId,
    );
  }

  @Get('variant/:variantId')
  findByVariant(
    @Param('variantId') variantId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.inventoryService.findByVariant(variantId, organizationId);
  }
}
