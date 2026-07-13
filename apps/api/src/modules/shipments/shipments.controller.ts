import { Controller, Param, Post } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post(':id/ship')
  ship(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.shipmentsService.markAsShipped(id, userId);
  }
}
