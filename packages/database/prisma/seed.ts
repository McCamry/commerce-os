import { PrismaClient } from "@prisma/client";

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

  console.log({
    country: thailand.code,
    organization: organization.code,
    store: store.code,
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
