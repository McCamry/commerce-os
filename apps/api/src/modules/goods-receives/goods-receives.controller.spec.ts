import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceivesController } from './goods-receives.controller';

describe('GoodsReceivesController', () => {
  let controller: GoodsReceivesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsReceivesController],
    }).compile();

    controller = module.get<GoodsReceivesController>(GoodsReceivesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
