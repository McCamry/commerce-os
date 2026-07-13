import { Test, TestingModule } from '@nestjs/testing';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';

describe('SalesOrdersController', () => {
  let controller: SalesOrdersController;
  const service = { confirmOrder: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesOrdersController],
      providers: [{ provide: SalesOrdersService, useValue: service }],
    }).compile();

    controller = module.get<SalesOrdersController>(SalesOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('confirms an order as the authenticated user', () => {
    controller.confirm('so-1', 'user-1');
    expect(service.confirmOrder).toHaveBeenCalledWith('so-1', 'user-1');
  });
});
