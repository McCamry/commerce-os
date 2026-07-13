import { Body, Controller, Param, Post } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  create(
    @Body() dto: CreateShipmentDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.shipmentsService.create(dto, organizationId);
  }

  @Post(':id/ship')
  ship(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; organizationId: string },
  ) {
    return this.shipmentsService.markAsShipped(
      id,
      user.userId,
      user.organizationId,
    );
  }
}
