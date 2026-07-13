import { Body, Controller, Post } from '@nestjs/common';
import { GoodsReceivesService } from './goods-receives.service';
import { CreateGoodsReceiveDto } from './dto/create-goods-receive.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('goods-receives')
export class GoodsReceivesController {
  constructor(private readonly goodsReceivesService: GoodsReceivesService) {}

  @Post()
  create(
    @Body() dto: CreateGoodsReceiveDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.goodsReceivesService.create({
      purchaseOrderId: dto.purchaseOrderId,
      warehouseId: dto.warehouseId,
      receiveNo: dto.receiveNo,
      receivedBy: userId,
      items: dto.items,
    });
  }
}
