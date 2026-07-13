import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Sprint 7 Seeding & E2E Test...');

  // 1. Get Existing Base Data
  const organization = await prisma.organization.findFirst();
  const store = await prisma.store.findFirst();
  const product = await prisma.product.findFirst();
  const variant = await prisma.productVariant.findFirst({
    where: { productId: product?.id }
  });
  const inventory = await prisma.inventory.findFirst({
    where: { variantId: variant?.id }
  });

  if (!organization || !store || !product || !variant || !inventory) {
    throw new Error('Required base data not found. Please run previous seeds.');
  }

  // 2. Setup Marketplace Infrastructure
  const marketplace = await prisma.marketplace.upsert({
    where: { code: 'SHOPEE' },
    update: {},
    create: {
      code: 'SHOPEE',
      name: 'Shopee',
      apiVersion: 'v2',
      baseUrl: 'https://partner.shopeemobile.com'
    }
  });

  const account = await prisma.marketplaceAccount.create({
    data: {
      organizationId: organization.id,
      marketplaceId: marketplace.id,
      name: 'MyCompany Shopee Account',
    }
  });

  const shop = await prisma.marketplaceShop.create({
    data: {
      accountId: account.id,
      storeId: store.id,
      shopId: 'shopee_shop_12345',
      shopName: 'MyCompany Official Store',
      country: 'TH',
      currency: 'THB',
    }
  });
  console.log('✅ Created Marketplace, Account, and Shop');

  // 3. Map Products and Inventory
  const mkpProduct = await prisma.marketplaceProduct.create({
    data: {
      shopId: shop.id,
      productId: product.id,
      marketplaceProductId: 'shopee_prod_9999',
    }
  });

  const mkpVariant = await prisma.marketplaceVariant.create({
    data: {
      marketplaceProductId: mkpProduct.id,
      variantId: variant.id,
      marketplaceSku: variant.sku,
      marketplaceVariantId: 'shopee_var_8888',
    }
  });

  const mkpInventory = await prisma.marketplaceInventory.create({
    data: {
      variantId: variant.id,
      shopId: shop.id,
      inventoryId: inventory.id,
      stock: inventory.quantityAvailable,
      lastSync: new Date()
    }
  });
  console.log(`✅ Mapped Product and Inventory (Stock synced: ${mkpInventory.stock})`);

  // 4. Simulate Incoming Webhook
  const webhook = await prisma.marketplaceWebhook.create({
    data: {
      marketplaceId: marketplace.id,
      event: 'order.status.update',
      payload: {
        order_sn: '240701SHOPEE123',
        status: 'READY_TO_SHIP'
      }
    }
  });
  console.log(`✅ Simulated Webhook Event: ${webhook.id}`);

  // 5. Create Mock Marketplace Order
  const mkpOrder = await prisma.marketplaceOrder.create({
    data: {
      shopId: shop.id,
      marketplaceOrderId: '240701SHOPEE123',
      orderStatus: 'READY_TO_SHIP',
      buyerName: 'Shopee Customer',
      orderDate: new Date(),
      items: {
        create: [{
          variantId: variant.id,
          quantity: 2,
          price: 29900
        }]
      }
    }
  });
  console.log(`✅ Created Marketplace Order: ${mkpOrder.marketplaceOrderId}`);

  console.log('\\n🎉 Sprint 7 E2E Test Completed Successfully!');
}

try {
  await main();
} catch (error) {
  console.error(error);
  throw error;
} finally {
  await prisma.$disconnect();
}
