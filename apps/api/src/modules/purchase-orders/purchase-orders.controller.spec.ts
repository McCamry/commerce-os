import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

describe('PurchaseOrdersController', () => {
  let controller: PurchaseOrdersController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    approve: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
      providers: [{ provide: PurchaseOrdersService, useValue: service }],
    }).compile();

    controller = module.get<PurchaseOrdersController>(PurchaseOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('scopes create and findAll to the caller organization', () => {
    const dto = {
      storeId: 's-1',
      warehouseId: 'wh-1',
      vendorId: 'v-1',
      purchaseNo: 'PO-1',
      items: [{ variantId: 'var-1', unitId: 'u-1', quantity: 2, unitPrice: 5 }],
    };
    controller.create(dto, 'org-1');
    expect(service.create).toHaveBeenCalledWith(dto, 'org-1');

    controller.findAll('org-1');
    expect(service.findAll).toHaveBeenCalledWith('org-1');
  });
});
