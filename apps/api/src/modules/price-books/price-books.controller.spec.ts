import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PriceBooksController } from './price-books.controller';
import { PriceBooksService } from './price-books.service';

describe('PriceBooksController', () => {
  let controller: PriceBooksController;
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
      controllers: [PriceBooksController],
      providers: [{ provide: PriceBooksService, useValue: service }],
    }).compile();
    controller = module.get<PriceBooksController>(PriceBooksController);
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
    controller.findAll('org-1', 'grp-1', 'ACTIVE');
    expect(service.findAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      customerGroupId: 'grp-1',
      status: 'ACTIVE',
    });
  });
});
