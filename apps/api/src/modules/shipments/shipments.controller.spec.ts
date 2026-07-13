import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';

describe('ShipmentsController', () => {
  let controller: ShipmentsController;
  const service = { markAsShipped: jest.fn(), create: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentsController],
      providers: [{ provide: ShipmentsService, useValue: service }],
    }).compile();

    controller = module.get<ShipmentsController>(ShipmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('ships a shipment as the authenticated user, scoped to the org', () => {
    controller.ship('sh-1', { userId: 'user-1', organizationId: 'org-1' });
    expect(service.markAsShipped).toHaveBeenCalledWith(
      'sh-1',
      'user-1',
      'org-1',
    );
  });

  it('creates a shipment scoped to the caller organization', () => {
    const dto = {
      salesOrderId: 'so-1',
      shipmentNo: 'SH-1',
      items: [{ salesOrderItemId: 'oi-1', quantity: 1 }],
    };
    controller.create(dto, 'org-1');
    expect(service.create).toHaveBeenCalledWith(dto, 'org-1');
  });
});
