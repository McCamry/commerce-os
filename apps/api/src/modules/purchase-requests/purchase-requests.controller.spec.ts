import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PurchaseRequestsController } from './purchase-requests.controller';
import { PurchaseRequestsService } from './purchase-requests.service';

describe('PurchaseRequestsController', () => {
  let controller: PurchaseRequestsController;
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
      controllers: [PurchaseRequestsController],
      providers: [{ provide: PurchaseRequestsService, useValue: service }],
    }).compile();
    controller = module.get<PurchaseRequestsController>(
      PurchaseRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('requires organizationId on findAll', () => {
    expect(() => controller.findAll(undefined as unknown as string)).toThrow(
      BadRequestException,
    );
  });

  it('forwards findAll filters to the service', () => {
    controller.findAll('org-1', 'store-1', 'DRAFT');
    expect(service.findAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      storeId: 'store-1',
      status: 'DRAFT',
    });
  });
});
