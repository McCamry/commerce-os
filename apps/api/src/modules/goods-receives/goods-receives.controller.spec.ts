import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceivesController } from './goods-receives.controller';
import { GoodsReceivesService } from './goods-receives.service';

describe('GoodsReceivesController', () => {
  let controller: GoodsReceivesController;
  const service = { create: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsReceivesController],
      providers: [{ provide: GoodsReceivesService, useValue: service }],
    }).compile();

    controller = module.get<GoodsReceivesController>(GoodsReceivesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('injects receivedBy from the authenticated user', () => {
    const dto = {
      purchaseOrderId: 'po-1',
      warehouseId: 'wh-1',
      receiveNo: 'GRN-1',
      items: [
        { variantId: 'v-1', unitId: 'u-1', locationId: 'loc-1', quantity: 5 },
      ],
    };
    controller.create(dto, 'user-1');
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ receivedBy: 'user-1', receiveNo: 'GRN-1' }),
    );
  });
});
