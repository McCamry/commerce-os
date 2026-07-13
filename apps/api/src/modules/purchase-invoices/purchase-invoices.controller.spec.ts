import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseInvoicesController } from './purchase-invoices.controller';
import { PurchaseInvoicesService } from './purchase-invoices.service';

describe('PurchaseInvoicesController', () => {
  let controller: PurchaseInvoicesController;
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
      controllers: [PurchaseInvoicesController],
      providers: [{ provide: PurchaseInvoicesService, useValue: service }],
    }).compile();
    controller = module.get<PurchaseInvoicesController>(
      PurchaseInvoicesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards findAll filters to the service', () => {
    controller.findAll('org-1', 'vendor-1', 'po-1', 'PENDING');
    expect(service.findAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      vendorId: 'vendor-1',
      purchaseOrderId: 'po-1',
      status: 'PENDING',
    });
  });

  it('delegates create to the service', () => {
    const dto = {
      vendorId: 'vendor-1',
      invoiceNo: 'INV-1',
      invoiceDate: '2026-07-10',
      items: [],
    };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
