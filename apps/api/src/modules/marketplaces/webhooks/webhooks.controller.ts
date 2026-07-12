import { Controller, Post, Body, Param, Headers, HttpCode } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('marketplaces/webhooks')
export class WebhooksController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('marketplace_sync') private readonly syncQueue: Queue,
  ) {}

  @Public()
  @Post(':connector')
  @HttpCode(200)
  async handleWebhook(
    @Param('connector') connector: string,
    @Headers() headers: any,
    @Body() payload: any
  ) {
    // 1. Find marketplace
    const marketplace = await this.prisma.marketplace.findUnique({
      where: { code: connector.toUpperCase() }
    });

    if (!marketplace) {
      // Just log and return 200 so marketplace stops retrying
      console.warn(`Webhook received for unknown marketplace: ${connector}`);
      return { received: true };
    }

    // 2. Save webhook event to database for audit/retry
    const webhookEvent = await this.prisma.marketplaceWebhook.create({
      data: {
        marketplaceId: marketplace.id,
        event: payload.type || 'UNKNOWN',
        payload: payload,
      }
    });

    // 3. Push to BullMQ for asynchronous processing
    await this.syncQueue.add('process-webhook', {
      webhookId: webhookEvent.id,
      connector: marketplace.code,
      payload
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    return { received: true };
  }
}
