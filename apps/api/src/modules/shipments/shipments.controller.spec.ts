import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';

describe('ShipmentsController', () => {
  let controller: ShipmentsController;
  const service = { markAsShipped: jest.fn() };

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

  it('ships a shipment as the authenticated user', () => {
    controller.ship('sh-1', 'user-1');
    expect(service.markAsShipped).toHaveBeenCalledWith('sh-1', 'user-1');
  });
});
