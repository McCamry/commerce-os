import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('purchase-requests')
export class PurchaseRequestsController {
  constructor(
    private readonly purchaseRequestsService: PurchaseRequestsService,
  ) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
  ) {
    return this.purchaseRequestsService.findAll({
      organizationId,
      storeId,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.purchaseRequestsService.findOne(id, organizationId);
  }

  @Post()
  create(@Body() dto: CreatePurchaseRequestDto) {
    return this.purchaseRequestsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseRequestDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.purchaseRequestsService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.purchaseRequestsService.remove(id, organizationId);
  }
}
