import { Test, TestingModule } from '@nestjs/testing';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';

describe('QuotationsController', () => {
  let controller: QuotationsController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotationsController],
      providers: [{ provide: QuotationsService, useValue: service }],
    }).compile();

    controller = module.get<QuotationsController>(QuotationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards findAll filters to the service', () => {
    controller.findAll('org-1', 'store-1', 'cust-1', 'DRAFT');

    expect(service.findAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      storeId: 'store-1',
      customerId: 'cust-1',
      status: 'DRAFT',
    });
  });

  it('delegates create to the service', () => {
    const dto = {
      organizationId: 'org-1',
      storeId: 's-1',
      customerId: 'c-1',
      quotationNo: 'QT-1',
      items: [],
    };
    controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
