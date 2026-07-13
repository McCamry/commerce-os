import { PrismaClient, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const thailand = await prisma.country.upsert({
    where: { code: "TH" },
    update: {
      nameTh: "ไทย",
      nameEn: "Thailand",
      phoneCode: "+66",
      currencyCode: "THB",
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      code: "TH",
      nameTh: "ไทย",
      nameEn: "Thailand",
      phoneCode: "+66",
      currencyCode: "THB",
    },
  });

  const bangkok = await prisma.province.upsert({
    where: {
      countryId_code: {
        countryId: thailand.id,
        code: "10",
      },
    },
    update: {
      nameTh: "กรุงเทพมหานคร",
      nameEn: "Bangkok",
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      countryId: thailand.id,
      code: "10",
      nameTh: "กรุงเทพมหานคร",
      nameEn: "Bangkok",
    },
  });

  const pathumWan = await prisma.district.upsert({
    where: {
      provinceId_code: {
        provinceId: bangkok.id,
        code: "1007",
      },
    },
    update: {
      nameTh: "ปทุมวัน",
      nameEn: "Pathum Wan",
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      provinceId: bangkok.id,
      code: "1007",
      nameTh: "ปทุมวัน",
      nameEn: "Pathum Wan",
    },
  });

  const lumphini = await prisma.subdistrict.upsert({
    where: {
      districtId_code: {
        districtId: pathumWan.id,
        code: "100704",
      },
    },
    update: {
      nameTh: "ลุมพินี",
      nameEn: "Lumphini",
      postalCode: "10330",
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      districtId: pathumWan.id,
      code: "100704",
      nameTh: "ลุมพินี",
      nameEn: "Lumphini",
      postalCode: "10330",
    },
  });

  const organization = await prisma.organization.upsert({
    where: { code: "DEMO" },
    update: {
      name: "Demo Commerce Co., Ltd.",
      slug: "demo-commerce",
      countryId: thailand.id,
      provinceId: bangkok.id,
      districtId: pathumWan.id,
      subdistrictId: lumphini.id,
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      code: "DEMO",
      name: "Demo Commerce Co., Ltd.",
      slug: "demo-commerce",
      contactPerson: "CommerceOS Admin",
      phone1: "+6620000000",
      email: "admin@example.com",
      address1: "Demo headquarters",
      countryId: thailand.id,
      provinceId: bangkok.id,
      districtId: pathumWan.id,
      subdistrictId: lumphini.id,
    },
  });

  const store = await prisma.store.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "MAIN",
      },
    },
    update: {
      name: "Demo Main Store",
      slug: "main",
      countryId: thailand.id,
      provinceId: bangkok.id,
      districtId: pathumWan.id,
      subdistrictId: lumphini.id,
      timezone: "Asia/Bangkok",
      currency: "THB",
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      organizationId: organization.id,
      code: "MAIN",
      name: "Demo Main Store",
      slug: "main",
      contactPerson: "CommerceOS Admin",
      phone1: "+6620000000",
      email: "store@example.com",
      address1: "Demo storefront",
      countryId: thailand.id,
      provinceId: bangkok.id,
      districtId: pathumWan.id,
      subdistrictId: lumphini.id,
      timezone: "Asia/Bangkok",
      currency: "THB",
    },
  });

  // ==========================================
  // PRODUCT CATEGORY SEEDING
  // ==========================================
  const electronics = await prisma.productCategory.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "ELECT" } },
    update: { name: "Electronics", status: "ACTIVE", deletedAt: null },
    create: { organizationId: organization.id, code: "ELECT", name: "Electronics" },
  });

  const mobilePhones = await prisma.productCategory.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "MOBILE" } },
    update: { name: "Mobile Phones", parentId: electronics.id, status: "ACTIVE", deletedAt: null },
    create: { organizationId: organization.id, code: "MOBILE", name: "Mobile Phones", parentId: electronics.id },
  });

  const beverages = await prisma.productCategory.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "BEV" } },
    update: { name: "Beverages", status: "ACTIVE", deletedAt: null },
    create: { organizationId: organization.id, code: "BEV", name: "Beverages" },
  });

  const coffee = await prisma.productCategory.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "COFFEE" } },
    update: { name: "Coffee", parentId: beverages.id, status: "ACTIVE", deletedAt: null },
    create: { organizationId: organization.id, code: "COFFEE", name: "Coffee", parentId: beverages.id },
  });

  const food = await prisma.productCategory.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "FOOD" } },
    update: { name: "Food", status: "ACTIVE", deletedAt: null },
    create: { organizationId: organization.id, code: "FOOD", name: "Food" },
  });

  // ==========================================
  // BRAND SEEDING
  // ==========================================
  const apple = await prisma.brand.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "APPLE" } },
    update: { name: "Apple", status: "ACTIVE" },
    create: { organizationId: organization.id, code: "APPLE", name: "Apple" },
  });

  const xiaomi = await prisma.brand.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "XIAOMI" } },
    update: { name: "Xiaomi", status: "ACTIVE" },
    create: { organizationId: organization.id, code: "XIAOMI", name: "Xiaomi" },
  });

  // ==========================================
  // UNIT SEEDING
  // ==========================================
  const pcs = await prisma.unit.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "PCS" } },
    update: { name: "Piece", symbol: "PCS", status: "ACTIVE" },
    create: { organizationId: organization.id, code: "PCS", name: "Piece", symbol: "PCS" },
  });

  // ==========================================
  // TAX SEEDING
  // ==========================================
  const vat7 = await prisma.tax.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "VAT7" } },
    update: { name: "VAT 7%", rate: "7.00", status: "ACTIVE" },
    create: { organizationId: organization.id, code: "VAT7", name: "VAT 7%", rate: "7.00" },
  });

  const noVat = await prisma.tax.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "NOVAT" } },
    update: { name: "No VAT", rate: "0.00", status: "ACTIVE" },
    create: { organizationId: organization.id, code: "NOVAT", name: "No VAT", rate: "0.00" },
  });

  // ==========================================
  // ATTRIBUTE SEEDING
  // ==========================================
  const colorAttr = await prisma.attribute.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: "Color" } },
    update: {},
    create: { organizationId: organization.id, name: "Color" },
  });

  const storageAttr = await prisma.attribute.upsert({
    where: { organizationId_name: { organizationId: organization.id, name: "Storage" } },
    update: {},
    create: { organizationId: organization.id, name: "Storage" },
  });

  const blackVal = await prisma.attributeValue.upsert({
    where: { attributeId_value: { attributeId: colorAttr.id, value: "Black" } },
    update: {},
    create: { attributeId: colorAttr.id, value: "Black" },
  });

  const blueVal = await prisma.attributeValue.upsert({
    where: { attributeId_value: { attributeId: colorAttr.id, value: "Blue" } },
    update: {},
    create: { attributeId: colorAttr.id, value: "Blue" },
  });

  const val128Val = await prisma.attributeValue.upsert({
    where: { attributeId_value: { attributeId: storageAttr.id, value: "128GB" } },
    update: {},
    create: { attributeId: storageAttr.id, value: "128GB" },
  });

  const val256Val = await prisma.attributeValue.upsert({
    where: { attributeId_value: { attributeId: storageAttr.id, value: "256GB" } },
    update: {},
    create: { attributeId: storageAttr.id, value: "256GB" },
  });

  // ==========================================
  // PRODUCT MASTER & VARIANTS SEEDING
  // ==========================================
  const iphone17 = await prisma.product.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "IP17" } },
    update: {
      categoryId: mobilePhones.id,
      brandId: apple.id,
      unitId: pcs.id,
      taxId: vat7.id,
      name: "iPhone 17",
      shortName: "IP17",
      sku: "IP17-MASTER",
      description: "Next-generation iPhone 17 by Apple",
      status: "ACTIVE",
      isActive: true,
      weight: "0.2500",
      width: "7.6000",
      height: "15.0000",
      length: "0.8000",
      slug: "iphone-17",
      metaTitle: "iPhone 17",
      metaDescription: "Buy Apple iPhone 17 at CommerceOS demo.",
    },
    create: {
      organizationId: organization.id,
      categoryId: mobilePhones.id,
      brandId: apple.id,
      unitId: pcs.id,
      taxId: vat7.id,
      code: "IP17",
      sku: "IP17-MASTER",
      name: "iPhone 17",
      shortName: "IP17",
      description: "Next-generation iPhone 17 by Apple",
      status: "ACTIVE",
      isActive: true,
      weight: "0.2500",
      width: "7.6000",
      height: "15.0000",
      length: "0.8000",
      slug: "iphone-17",
      metaTitle: "iPhone 17",
      metaDescription: "Buy Apple iPhone 17 at CommerceOS demo.",
    },
  });

  // Seeding images
  await prisma.productImage.deleteMany({ where: { productId: iphone17.id } });
  await prisma.productImage.createMany({
    data: [
      { productId: iphone17.id, url: "https://example.com/iphone17-front.jpg", sortOrder: 0, altText: "Front view" },
      { productId: iphone17.id, url: "https://example.com/iphone17-back.jpg", sortOrder: 1, altText: "Back view" },
    ],
  });

  // Helper function to seed variant details
  const seedVariant = async (sku: string, name: string, attrValues: string[], prices: {type: string, val: string}[], barcodes: {code: string, isDefault: boolean}[], marketplaces: {platform: "SHOPEE" | "LAZADA" | "TIKTOK" | "WEBSITE", extId: string, extVarId?: string}[]) => {
    const variant = await prisma.productVariant.upsert({
      where: { productId_sku: { productId: iphone17.id, sku } },
      update: { name, status: "ACTIVE" },
      create: { productId: iphone17.id, sku, name },
    });

    // Clear old details to avoid primary key/unique key collision during re-seed
    await prisma.productVariantAttributeValue.deleteMany({ where: { variantId: variant.id } });
    await prisma.productBarcode.deleteMany({ where: { variantId: variant.id } });
    await prisma.productPrice.deleteMany({ where: { variantId: variant.id } });
    await prisma.productMarketplace.deleteMany({ where: { variantId: variant.id } });

    // Attributes
    for (const valId of attrValues) {
      await prisma.productVariantAttributeValue.create({
        data: { variantId: variant.id, attributeValueId: valId },
      });
    }

    // Barcodes
    await prisma.productBarcode.createMany({
      data: barcodes.map(b => ({ variantId: variant.id, barcode: b.code, isDefault: b.isDefault })),
    });

    // Prices
    await prisma.productPrice.createMany({
      data: prices.map(p => ({ variantId: variant.id, priceType: p.type, price: p.val, currency: "THB" })),
    });

    // Marketplace
    await prisma.productMarketplace.createMany({
      data: marketplaces.map(m => ({ variantId: variant.id, marketplace: m.platform, externalProductId: m.extId, externalVariantId: m.extVarId })),
    });
  };

  // Variant 1: 128GB Black
  await seedVariant(
    "IP17-128-BLK",
    "iPhone 17 128GB Black",
    [blackVal.id, val128Val.id],
    [
      { type: "Retail", val: "32900.00" },
      { type: "Wholesale", val: "31000.00" },
    ],
    [
      { code: "885000001", isDefault: true },
      { code: "885000002", isDefault: false },
    ],
    [
      { platform: "SHOPEE", extId: "SP-12345678", extVarId: "SPV-987654" },
      { platform: "LAZADA", extId: "LZ-987654", extVarId: "LZV-56789" },
    ]
  );

  // Variant 2: 256GB Black
  await seedVariant(
    "IP17-256-BLK",
    "iPhone 17 256GB Black",
    [blackVal.id, val256Val.id],
    [
      { type: "Retail", val: "36900.00" },
    ],
    [
      { code: "885000003", isDefault: true },
    ],
    [
      { platform: "SHOPEE", extId: "SP-12345678", extVarId: "SPV-987655" },
    ]
  );

  // Variant 3: 256GB Blue
  await seedVariant(
    "IP17-256-BLU",
    "iPhone 17 256GB Blue",
    [blueVal.id, val256Val.id],
    [
      { type: "Retail", val: "36900.00" },
    ],
    [
      { code: "885000004", isDefault: true },
    ],
    [
      { platform: "SHOPEE", extId: "SP-12345678", extVarId: "SPV-987656" },
    ]
  );

  // Seeding Permissions
  const permissionsList = [
    { code: "product.read", module: "Product", name: "Read Product", description: "Allow viewing products" },
    { code: "product.create", module: "Product", name: "Create Product", description: "Allow creating products" },
    { code: "product.update", module: "Product", name: "Update Product", description: "Allow updating products" },
    { code: "product.delete", module: "Product", name: "Delete Product", description: "Allow deleting products" },
    { code: "user.manage", module: "User", name: "Manage Users", description: "Allow full user management" },
  ];

  const dbPermissions = [];
  for (const perm of permissionsList) {
    const dbPerm = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        module: perm.module,
        name: perm.name,
        description: perm.description,
      },
      create: perm,
    });
    dbPermissions.push(dbPerm);
  }

  // Seeding Roles
  const adminRole = await prisma.role.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "ADMIN",
      },
    },
    update: {
      name: "Admin",
      description: "System Administrator",
      isSystem: true,
    },
    create: {
      organizationId: organization.id,
      code: "ADMIN",
      name: "Admin",
      description: "System Administrator",
      isSystem: true,
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "CASHIER",
      },
    },
    update: {
      name: "Cashier",
      description: "Cashier storefront",
      isSystem: false,
    },
    create: {
      organizationId: organization.id,
      code: "CASHIER",
      name: "Cashier",
      description: "Cashier storefront",
      isSystem: false,
    },
  });

  // Role Permissions mapping for ADMIN (give all permissions)
  for (const perm of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Role Permissions mapping for CASHIER (give product.read only)
  const productReadPerm = dbPermissions.find(p => p.code === "product.read");
  if (productReadPerm) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: cashierRole.id,
          permissionId: productReadPerm.id,
        },
      },
      update: {},
      create: {
        roleId: cashierRole.id,
        permissionId: productReadPerm.id,
      },
    });
  }

  // User: Admin
  const passwordHash = bcrypt.hashSync("password123", 10);
  const adminUser = await prisma.user.upsert({
    where: {
      organizationId_username: {
        organizationId: organization.id,
        username: "admin",
      },
    },
    update: {
      email: "admin@example.com",
      passwordHash,
      displayName: "Administrator",
      defaultStoreId: store.id,
      status: "ACTIVE",
    },
    create: {
      organizationId: organization.id,
      defaultStoreId: store.id,
      username: "admin",
      email: "admin@example.com",
      passwordHash,
      displayName: "Administrator",
      status: "ACTIVE",
    },
  });

  // Link Admin User to Admin Role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Link Admin User to Store (UserStore)
  await prisma.userStore.upsert({
    where: {
      userId_storeId: {
        userId: adminUser.id,
        storeId: store.id,
      },
    },
    update: {
      isDefault: true,
    },
    create: {
      userId: adminUser.id,
      storeId: store.id,
      isDefault: true,
    },
  });

  // Query variant for stock seeding
  const variant = await prisma.productVariant.findFirst({
    where: { sku: "IP17-128-BLK" },
  });

  // Seeding extra permissions for inventory
  const newPermissions = [
    { code: "inventory.read", module: "Inventory", name: "Read Inventory", description: "Allow viewing inventory levels" },
    { code: "inventory.adjust", module: "Inventory", name: "Adjust Inventory", description: "Allow adjusting inventory levels" },
    { code: "inventory.transfer", module: "Inventory", name: "Transfer Inventory", description: "Allow stock transfers" },
  ];

  for (const perm of newPermissions) {
    const dbPerm = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        module: perm.module,
        name: perm.name,
        description: perm.description,
      },
      create: perm,
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: dbPerm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: dbPerm.id,
      },
    });
  }

  // Seeding Warehouses
  const mainWarehouse = await prisma.warehouse.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "WH-MAIN",
      },
    },
    update: {
      name: "Main Warehouse",
      description: "Main storage facility",
      isDefault: true,
    },
    create: {
      organizationId: organization.id,
      storeId: store.id,
      code: "WH-MAIN",
      name: "Main Warehouse",
      description: "Main storage facility",
      isDefault: true,
    },
  });

  const onlineWarehouse = await prisma.warehouse.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: "WH-ONLINE",
      },
    },
    update: {
      name: "Online Warehouse",
      description: "E-Commerce picking warehouse",
      isDefault: false,
    },
    create: {
      organizationId: organization.id,
      storeId: store.id,
      code: "WH-ONLINE",
      name: "Online Warehouse",
      description: "E-Commerce picking warehouse",
      isDefault: false,
    },
  });

  // Seeding warehouse location (WMS)
  const warehouseLocation = await prisma.warehouseLocation.upsert({
    where: { code: "LOC-A01-01" },
    update: { status: "ACTIVE" },
    create: {
      warehouseId: mainWarehouse.id,
      code: "LOC-A01-01",
      barcode: "BC-LOC-A01-01",
      status: "ACTIVE",
    },
  });

  // Seed inventory levels
  if (variant) {
    // Lot
    await prisma.inventoryLot.deleteMany({ where: { variantId: variant.id } });
    const lot = await prisma.inventoryLot.create({
      data: {
        variantId: variant.id,
        lotNumber: "LOT240701",
        manufactureDate: new Date("2026-07-01"),
        expireDate: new Date("2027-07-01"),
      },
    });

    // Serials
    await prisma.inventorySerial.deleteMany({ where: { variantId: variant.id } });
    await prisma.inventorySerial.createMany({
      data: [
        { variantId: variant.id, serialNumber: "SN-IP17-001", status: "AVAILABLE" },
        { variantId: variant.id, serialNumber: "SN-IP17-002", status: "AVAILABLE" },
        { variantId: variant.id, serialNumber: "SN-IP17-003", status: "AVAILABLE" },
      ],
    });

    // Inventory at location
    await prisma.inventoryLocation.deleteMany({
      where: {
        warehouseLocationId: warehouseLocation.id,
        productVariantId: variant.id,
      },
    });
    await prisma.inventoryLocation.create({
      data: {
        warehouseLocationId: warehouseLocation.id,
        productVariantId: variant.id,
        lotId: lot.id,
        quantity: 100,
        reservedQty: 20,
        availableQty: 80,
      },
    });

    // Movement ledger
    await prisma.inventoryMovement.deleteMany({
      where: { variantId: variant.id, referenceType: "INITIAL_SEED" },
    });
    await prisma.inventoryMovement.create({
      data: {
        type: "RECEIVE",
        variantId: variant.id,
        toLocationId: warehouseLocation.id,
        quantity: 100,
        referenceType: "INITIAL_SEED",
        movedBy: adminUser.id,
      },
    });
  }

  console.log({
    country: thailand.code,
    organization: organization.code,
    store: store.code,
    category: mobilePhones.name,
    product: iphone17.name,
    adminUser: adminUser.username,
  });
}

try {
  await main();
} catch (error) {
  console.error(error);
  throw error;
} finally {
  await prisma.$disconnect();
}
