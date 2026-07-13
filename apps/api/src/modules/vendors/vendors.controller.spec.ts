import { Test, TestingModule } from '@nestjs/testing';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

describe('VendorsController', () => {
  let controller: VendorsController;
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
      controllers: [VendorsController],
      providers: [{ provide: VendorsService, useValue: service }],
    }).compile();

    controller = module.get<VendorsController>(VendorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards findAll filters to the service', () => {
    controller.findAll('org-1', 'ACTIVE');

    expect(service.findAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      status: 'ACTIVE',
    });
  });

  it('delegates create to the service', () => {
    const dto = { code: 'V1', name: 'Supplier' };
    controller.create(dto, 'org-1');

    expect(service.create).toHaveBeenCalledWith(dto, 'org-1');
  });
});
