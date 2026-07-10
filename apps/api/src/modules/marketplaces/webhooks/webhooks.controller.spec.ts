import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { WebhooksController } from './webhooks.controller';
import { PrismaService } from '../../../database/prisma.service';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  const prisma = {
    marketplace: { findUnique: jest.fn() },
    marketplaceWebhook: { create: jest.fn() },
  };
  const queue = { add: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: getQueueToken('marketplace_sync'), useValue: queue },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('acknowledges without queueing for an unknown marketplace', async () => {
    prisma.marketplace.findUnique.mockResolvedValue(null);

    const result = await controller.handleWebhook('unknown', {}, {});

    expect(result).toEqual({ received: true });
    expect(prisma.marketplaceWebhook.create).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('persists the event and enqueues processing for a known marketplace', async () => {
    prisma.marketplace.findUnique.mockResolvedValue({
      id: 'mp-1',
      code: 'SHOPEE',
    });
    prisma.marketplaceWebhook.create.mockResolvedValue({ id: 'wh-1' });

    const result = await controller.handleWebhook('shopee', {}, {
      type: 'ORDER_UPDATE',
    });

    expect(prisma.marketplaceWebhook.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          marketplaceId: 'mp-1',
          event: 'ORDER_UPDATE',
        }),
      }),
    );
    expect(queue.add).toHaveBeenCalledWith(
      'process-webhook',
      expect.objectContaining({ webhookId: 'wh-1', connector: 'SHOPEE' }),
      expect.any(Object),
    );
    expect(result).toEqual({ received: true });
  });
});
