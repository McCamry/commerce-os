import { Test, TestingModule } from '@nestjs/testing';
import { SalesInvoicesController } from './sales-invoices.controller';
import { SalesInvoicesService } from './sales-invoices.service';

describe('SalesInvoicesController', () => {
  let controller: SalesInvoicesController;
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
      controllers: [SalesInvoicesController],
      providers: [{ provide: SalesInvoicesService, useValue: service }],
    }).compile();
    controller = module.get<SalesInvoicesController>(SalesInvoicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards findAll filters to the service', () => {
    controller.findAll('so-1', 'PENDING');
    expect(service.findAll).toHaveBeenCalledWith({
      salesOrderId: 'so-1',
      status: 'PENDING',
    });
  });
});
