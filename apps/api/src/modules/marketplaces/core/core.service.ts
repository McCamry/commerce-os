import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
@Processor('marketplace_sync')
export class CoreService extends WorkerHost {
  private readonly logger = new Logger(CoreService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('marketplace_sync') private readonly syncQueue: Queue,
  ) {
    super();
  }

  // 1. Listen to internal Commerce OS events and push to BullMQ
  @OnEvent('sales-order.confirmed')
  async handleSalesOrderConfirmed(payload: any) {
    this.logger.log(`Received sales-order.confirmed event for Order ID: ${payload.id}`);
    
    // E.g., we might need to sync inventory deductions to marketplaces
    await this.syncQueue.add('sync-inventory', {
      source: 'sales-order.confirmed',
      salesOrderId: payload.id,
      warehouseId: payload.warehouseId
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  @OnEvent('shipment.shipped')
  async handleShipmentShipped(payload: any) {
    this.logger.log(`Received shipment.shipped event for Shipment ID: ${payload.id}`);
    
    // We need to update tracking info on the marketplace
    await this.syncQueue.add('sync-shipment', {
      source: 'shipment.shipped',
      shipmentId: payload.id,
      salesOrderId: payload.salesOrderId
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  // 2. Process BullMQ Jobs
  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    
    try {
      switch (job.name) {
        case 'sync-inventory':
          return this.processSyncInventory(job.data);
        case 'sync-shipment':
          return this.processSyncShipment(job.data);
        case 'process-webhook':
          return this.processWebhook(job.data);
        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processSyncInventory(data: any) {
    this.logger.log(`Syncing inventory for Order ${data.salesOrderId}`);
    // Implement inventory sync logic across connected marketplaces
    // e.g. finding MarketplaceShop mappings and pushing new stock levels
    return { success: true };
  }

  private async processSyncShipment(data: any) {
    this.logger.log(`Syncing shipment tracking for Shipment ${data.shipmentId}`);
    // Implement shipment sync logic across connected marketplaces
    return { success: true };
  }

  private async processWebhook(data: any) {
    this.logger.log(`Processing webhook ${data.webhookId} from ${data.connector}`);
    // Here we would delegate to the specific connector (e.g. ShopeeService)
    // based on data.connector, parsing order/product events
    
    // Mark as processed
    await this.prisma.marketplaceWebhook.update({
      where: { id: data.webhookId },
      data: { processed: true }
    });
    
    return { success: true };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
