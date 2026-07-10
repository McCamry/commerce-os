import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseReturnsController } from './purchase-returns.controller';
import { PurchaseReturnsService } from './purchase-returns.service';

describe('PurchaseReturnsController', () => {
  let controller: PurchaseReturnsController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseReturnsController],
      providers: [{ provide: PurchaseReturnsService, useValue: service }],
    }).compile();
    controller = module.get<PurchaseReturnsController>(
      PurchaseReturnsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards findAll filters to the service', () => {
    controller.findAll('vendor-1', 'DRAFT');
    expect(service.findAll).toHaveBeenCalledWith({
      vendorId: 'vendor-1',
      status: 'DRAFT',
    });
  });
});
