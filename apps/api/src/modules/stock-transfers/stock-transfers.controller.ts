import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockTransfersService } from './stock-transfers.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('stock-transfers')
@UseGuards(JwtAuthGuard)
export class StockTransfersController {
  constructor(private readonly transfersService: StockTransfersService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.transfersService.findAll({ organizationId, warehouseId });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.transfersService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreateStockTransferDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.transfersService.create(dto, user.sub);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.transfersService.approve(id, organizationId);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; organizationId: string },
  ) {
    return this.transfersService.complete(id, user.sub, user.organizationId);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.transfersService.cancel(id, organizationId);
  }
}
