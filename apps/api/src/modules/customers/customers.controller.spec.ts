import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

describe('CustomersController', () => {
  let controller: CustomersController;
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
      controllers: [CustomersController],
      providers: [{ provide: CustomersService, useValue: service }],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards findAll filters to the service', () => {
    controller.findAll('org-1', 'grp-1', 'ACTIVE');

    expect(service.findAll).toHaveBeenCalledWith({
      organizationId: 'org-1',
      customerGroupId: 'grp-1',
      status: 'ACTIVE',
    });
  });

  it('delegates create to the service', () => {
    const dto = { organizationId: 'org-1', code: 'C1', name: 'A' };
    controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
