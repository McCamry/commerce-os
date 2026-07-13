import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Starting Sprint 5 Seeding & E2E Test...');

  // 1. Get existing DEMO organization, store, warehouse, location, product variant, unit
  const org = await prisma.organization.findFirst({ where: { code: 'DEMO' } });
  const store = await prisma.store.findFirst({ where: { organizationId: org!.id } });
  const warehouse = await prisma.warehouse.findFirst({ where: { storeId: store!.id } });
  const location = await prisma.location.findFirst({ where: { warehouseId: warehouse!.id } });
  const variant = await prisma.productVariant.findFirst();
  const unit = await prisma.unit.findFirst();

  if (!org || !store || !warehouse || !location || !variant || !unit) {
    throw new Error('Required base data not found! Please run previous seeds.');
  }

  // 2. Create Vendor
  const timestamp = Date.now();
  const vendor = await prisma.vendor.create({
    data: {
      organizationId: org.id,
      code: `VND-${timestamp}`,
      name: `ABC Electronics Supplier ${timestamp}`,
      taxId: '1234567890123',
      creditDays: 30,
      paymentTerm: 'Net 30'
    }
  });
  console.log('✅ Created Vendor:', vendor.name);

  // 3. Create Purchase Order
  const po = await prisma.purchaseOrder.create({
    data: {
      organizationId: org.id,
      storeId: store.id,
      warehouseId: warehouse.id,
      vendorId: vendor.id,
      purchaseNo: `PO-${timestamp}`,
      status: 'APPROVED',
      subtotal: 5000,
      grandTotal: 5350, // with VAT 7%
      items: {
        create: [
          {
            variantId: variant.id,
            unitId: unit.id,
            quantity: 100,
            unitPrice: 50,
            lineTotal: 5000
          }
        ]
      }
    },
    include: { items: true }
  });
  console.log('✅ Created Purchase Order:', po.purchaseNo);

  // 4. Create Goods Receive (Receive 50 units first)
  const grn = await prisma.$transaction(async (tx) => {
    const receive = await tx.goodsReceive.create({
      data: {
        purchaseOrderId: po.id,
        warehouseId: warehouse.id,
        receiveNo: `GRN-${timestamp}`,
        receivedBy: 'System',
        status: 'COMPLETED',
        items: {
          create: [
            {
              purchaseOrderItemId: po.items[0].id,
              variantId: variant.id,
              unitId: unit.id,
              locationId: location.id,
              quantity: 50,
              status: 'COMPLETED'
            }
          ]
        }
      },
      include: { items: true }
    });

    // Update PO Item
    await tx.purchaseOrderItem.update({
      where: { id: po.items[0].id },
      data: { receivedQty: 50, status: 'PARTIALLY_RECEIVED' }
    });
    // Update PO
    await tx.purchaseOrder.update({
      where: { id: po.id },
      data: { status: 'PARTIALLY_RECEIVED' }
    });

    // Inventory Transaction
    await tx.inventoryTransaction.create({
      data: {
        type: 'PURCHASE_RECEIPT',
        referenceType: 'GRN',
        referenceId: receive.receiveNo,
        warehouseId: warehouse.id,
        locationId: location.id,
        variantId: variant.id,
        quantity: 50
      }
    });

    // Update Inventory
    const inv = await tx.inventory.findFirst({
      where: { warehouseId: warehouse.id, locationId: location.id, variantId: variant.id }
    });
    if (inv) {
      await tx.inventory.update({
        where: { id: inv.id },
        data: { quantityOnHand: { increment: 50 }, quantityAvailable: { increment: 50 } }
      });
    } else {
      await tx.inventory.create({
        data: {
          warehouseId: warehouse.id,
          locationId: location.id,
          variantId: variant.id,
          quantityOnHand: 50,
          quantityAvailable: 50,
          quantityReserved: 0
        }
      });
    }

    return receive;
  });
  console.log('✅ Created Goods Receive (50 units):', grn.receiveNo);

  // 5. Verify Inventory
  const updatedInv = await prisma.inventory.findFirst({
    where: { warehouseId: warehouse.id, locationId: location.id, variantId: variant.id }
  });
  console.log('✅ Verified Inventory OnHand:', updatedInv?.quantityOnHand);

  // 6. Create Purchase Invoice for 50 units
  const invoice = await prisma.purchaseInvoice.create({
    data: {
      vendorId: vendor.id,
      purchaseOrderId: po.id,
      invoiceNo: `INV-${timestamp}`,
      invoiceDate: new Date(),
      subtotal: 2500,
      vat: 175,
      grandTotal: 2675,
      status: 'PENDING',
      items: {
        create: [
          {
            variantId: variant.id,
            unitId: unit.id,
            quantity: 50,
            unitPrice: 50,
            lineTotal: 2500
          }
        ]
      }
    }
  });
  console.log('✅ Created Purchase Invoice:', invoice.invoiceNo);

  // 7. Pay the Invoice
  const payment = await prisma.purchasePayment.create({
    data: {
      purchaseInvoiceId: invoice.id,
      paymentMethod: 'TRANSFER',
      amount: 2675,
      reference: 'TXN123456',
      status: 'COMPLETED'
    }
  });
  await prisma.purchaseInvoice.update({
    where: { id: invoice.id },
    data: { status: 'PAID' }
  });
  console.log('✅ Created Payment for Invoice:', payment.reference);

  console.log('\n🎉 Sprint 5 E2E Test Completed Successfully!');
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
