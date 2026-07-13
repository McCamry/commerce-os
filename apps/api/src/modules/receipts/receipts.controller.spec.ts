import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';

describe('ReceiptsController', () => {
  let controller: ReceiptsController;
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
      controllers: [ReceiptsController],
      providers: [{ provide: ReceiptsService, useValue: service }],
    }).compile();
    controller = module.get<ReceiptsController>(ReceiptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards findAll filters to the service', () => {
    controller.findAll('org-1', 'si-1', 'COMPLETED');
    expect(service.findAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      salesInvoiceId: 'si-1',
      status: 'COMPLETED',
    });
  });

  it('delegates create to the service', () => {
    const dto = {
      salesInvoiceId: 'si-1',
      receiptNo: 'RCPT-1',
      paymentMethod: 'CASH',
      amount: 500,
    };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
