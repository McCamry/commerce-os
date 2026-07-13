import { Test, TestingModule } from '@nestjs/testing';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';

describe('SalesOrdersController', () => {
  let controller: SalesOrdersController;
  const service = {
    confirmOrder: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

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

  it('confirms an order as the authenticated user, scoped to the org', () => {
    controller.confirm('so-1', { userId: 'user-1', organizationId: 'org-1' });
    expect(service.confirmOrder).toHaveBeenCalledWith(
      'so-1',
      'user-1',
      'org-1',
    );
  });

  it('scopes create and findAll to the caller organization', () => {
    const dto = {
      storeId: 's-1',
      customerId: 'c-1',
      orderNo: 'SO-1',
      items: [{ variantId: 'v-1', unitId: 'u-1', quantity: 1, unitPrice: 10 }],
    };
    controller.create(dto, 'org-1');
    expect(service.create).toHaveBeenCalledWith(dto, 'org-1');

    controller.findAll('org-1');
    expect(service.findAll).toHaveBeenCalledWith('org-1');
  });
});
