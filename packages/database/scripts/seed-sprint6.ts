import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Starting Sprint 6 Seeding & E2E Test...');

  // 1. Get existing DEMO organization, store, warehouse, location, product variant, unit
  const org = await prisma.organization.findFirst({ where: { code: 'DEMO' } });
  const store = await prisma.store.findFirst({ where: { organizationId: org!.id } });
  const warehouse = await prisma.warehouse.findFirst({ where: { storeId: store!.id } });
  const location = await prisma.location.findFirst({ where: { warehouseId: warehouse!.id } });
  const variant = await prisma.productVariant.findFirst();
  const unit = await prisma.unit.findFirst();
  const user = await prisma.user.findFirst();

  if (!org || !store || !warehouse || !location || !variant || !unit || !user) {
    throw new Error('Required base data not found! Please run previous seeds.');
  }

  const timestamp = Date.now();

  // 2. Create Sales Channel
  const channel = await prisma.salesChannel.create({
    data: {
      organizationId: org.id,
      code: `WEB-${timestamp}`,
      name: `E-Commerce Website ${timestamp}`,
    }
  });

  // 3. Create Customer Group & Customer
  const group = await prisma.customerGroup.create({
    data: {
      organizationId: org.id,
      code: `VIP-${timestamp}`,
      name: `VIP Members ${timestamp}`
    }
  });

  const customer = await prisma.customer.create({
    data: {
      organizationId: org.id,
      customerGroupId: group.id,
      code: `CUST-${timestamp}`,
      name: `John Doe ${timestamp}`,
      creditLimit: 50000,
      creditDays: 15
    }
  });
  console.log('✅ Created Customer:', customer.name);

  // 4. Check initial inventory
  const initialInv = await prisma.inventory.findFirst({
    where: { variantId: variant.id, locationId: location.id }
  });
  console.log('Initial Inventory OnHand:', initialInv?.quantityOnHand, 'Reserved:', initialInv?.quantityReserved, 'Available:', initialInv?.quantityAvailable);

  if (!initialInv || initialInv.quantityAvailable < 2) {
      console.log('Not enough inventory available. Updating manually to test Sales Flow.');
      if (initialInv) {
          await prisma.inventory.update({
              where: { id: initialInv.id },
              data: { quantityAvailable: { increment: 100 }, quantityOnHand: { increment: 100 } }
          });
      } else {
          await prisma.inventory.create({
              data: {
                  organizationId: org.id,
                  storeId: store.id,
                  warehouseId: warehouse.id,
                  locationId: location.id,
                  variantId: variant.id,
                  quantityOnHand: 100,
                  quantityAvailable: 100,
                  quantityReserved: 0
              }
          });
      }
  }

  // 5. Create Quotation (Optional step in real life, but good to test)
  const quotation = await prisma.quotation.create({
    data: {
      organizationId: org.id,
      storeId: store.id,
      customerId: customer.id,
      quotationNo: `QT-${timestamp}`,
      status: 'ACCEPTED',
      subtotal: 1000,
      grandTotal: 1070,
      items: {
        create: [{
          variantId: variant.id,
          unitId: unit.id,
          quantity: 2,
          unitPrice: 500,
          lineTotal: 1000
        }]
      }
    }
  });
  console.log('✅ Created Quotation:', quotation.quotationNo);

  // 6. Create Sales Order
  const order = await prisma.salesOrder.create({
    data: {
      organizationId: org.id,
      storeId: store.id,
      warehouseId: warehouse.id,
      customerId: customer.id,
      channelId: channel.id,
      quotationId: quotation.id,
      orderNo: `SO-${timestamp}`,
      status: 'DRAFT',
      subtotal: 1000,
      grandTotal: 1070,
      items: {
        create: [{
          variantId: variant.id,
          unitId: unit.id,
          quantity: 2,
          unitPrice: 500,
          lineTotal: 1000
        }]
      }
    },
    include: { items: true }
  });
  console.log('✅ Created Sales Order (DRAFT):', order.orderNo);

  // We simulate what the SalesOrdersService.confirmOrder would do here
  const { SalesOrdersService } = await import('../../../apps/api/src/modules/sales-orders/sales-orders.service.ts');
  const { PrismaService } = await import('../../../apps/api/src/database/prisma.service.ts');
  
  // Create a mock PrismaService that uses our raw prisma client
  const prismaService = new PrismaService();
  // Override the prisma operations
  Object.assign(prismaService, prisma);
  
  const soService = new SalesOrdersService(prismaService);
  
  await soService.confirmOrder(order.id, user.id);
  console.log('✅ Confirmed Sales Order (RESERVED Inventory)');

  const reservedInv = await prisma.inventory.findFirst({
    where: { variantId: variant.id, locationId: location.id }
  });
  console.log('Reserved Inventory Available:', reservedInv?.quantityAvailable, 'Reserved:', reservedInv?.quantityReserved, 'OnHand:', reservedInv?.quantityOnHand);

  // 7. Create Shipment
  const confirmedOrder = await prisma.salesOrder.findUnique({ where: { id: order.id }, include: { items: true } });

  const shipment = await prisma.shipment.create({
    data: {
      salesOrderId: order.id,
      shipmentNo: `SHP-${timestamp}`,
      status: 'PENDING',
      carrier: 'Kerry Express',
      trackingNo: `TRK-${timestamp}`,
      items: {
        create: [{
          salesOrderItemId: confirmedOrder!.items[0].id,
          quantity: 2
        }]
      }
    }
  });

  const { ShipmentsService } = await import('../../../apps/api/src/modules/shipments/shipments.service.ts');
  const shpService = new ShipmentsService(prismaService);

  await shpService.markAsShipped(shipment.id, user.id);
  console.log('✅ Processed Shipment (Deducted OnHand Inventory)');

  const finalInv = await prisma.inventory.findFirst({
    where: { variantId: variant.id, locationId: location.id }
  });
  console.log('Final Inventory OnHand:', finalInv?.quantityOnHand, 'Reserved:', finalInv?.quantityReserved);

  // 8. Create Sales Invoice and Receipt
  const invoice = await prisma.salesInvoice.create({
    data: {
      salesOrderId: order.id,
      invoiceNo: `INV-${timestamp}`,
      status: 'PENDING',
      subtotal: 1000,
      vat: 70,
      grandTotal: 1070,
      items: {
        create: [{
          variantId: variant.id,
          unitId: unit.id,
          quantity: 2,
          unitPrice: 500,
          lineTotal: 1000
        }]
      }
    }
  });

  await prisma.receipt.create({
    data: {
      salesInvoiceId: invoice.id,
      receiptNo: `REC-${timestamp}`,
      paymentMethod: 'TRANSFER',
      amount: 1070
    }
  });
  
  await prisma.salesInvoice.update({
    where: { id: invoice.id },
    data: { status: 'PAID' }
  });
  
  console.log('✅ Created Sales Invoice & Paid Receipt');
  
  console.log('\\n🎉 Sprint 6 E2E Test Completed Successfully!');
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
