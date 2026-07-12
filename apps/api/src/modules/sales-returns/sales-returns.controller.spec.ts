import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SalesReturnsController } from './sales-returns.controller';
import { SalesReturnsService } from './sales-returns.service';

describe('SalesReturnsController', () => {
  let controller: SalesReturnsController;
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
      controllers: [SalesReturnsController],
      providers: [{ provide: SalesReturnsService, useValue: service }],
    }).compile();
    controller = module.get<SalesReturnsController>(SalesReturnsController);
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
    controller.findAll('org-1', 'so-1', 'COMPLETED');
    expect(service.findAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      salesOrderId: 'so-1',
      status: 'COMPLETED',
    });
  });
});
