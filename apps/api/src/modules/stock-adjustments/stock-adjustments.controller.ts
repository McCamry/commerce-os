import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockAdjustmentsService } from './stock-adjustments.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('stock-adjustments')
@UseGuards(JwtAuthGuard)
export class StockAdjustmentsController {
  constructor(private readonly adjustmentsService: StockAdjustmentsService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.adjustmentsService.findAll({ organizationId, warehouseId });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.adjustmentsService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreateStockAdjustmentDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.adjustmentsService.create(dto, user.sub);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; organizationId: string },
  ) {
    return this.adjustmentsService.complete(id, user.sub, user.organizationId);
  }
}
