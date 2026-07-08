-- AlterTable
ALTER TABLE "countries"
  ADD COLUMN "phone_code" TEXT,
  ADD COLUMN "currency_code" TEXT,
  ADD COLUMN "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "provinces"
  ADD COLUMN "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "districts"
  ADD COLUMN "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subdistricts"
  ADD COLUMN "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "organizations" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "tax_id" TEXT,
  "contact_person" TEXT,
  "phone_1" TEXT,
  "phone_2" TEXT,
  "email" TEXT,
  "address1" TEXT,
  "address2" TEXT,
  "remark" TEXT,
  "country_id" TEXT NOT NULL,
  "province_id" TEXT,
  "district_id" TEXT,
  "subdistrict_id" TEXT,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "tax_id" TEXT,
  "contact_person" TEXT,
  "phone_1" TEXT,
  "phone_2" TEXT,
  "email" TEXT,
  "address1" TEXT,
  "address2" TEXT,
  "remark" TEXT,
  "country_id" TEXT NOT NULL,
  "province_id" TEXT,
  "district_id" TEXT,
  "subdistrict_id" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Bangkok',
  "currency" TEXT NOT NULL DEFAULT 'THB',
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_country_status" ON "countries"("status");

-- CreateIndex
CREATE INDEX "idx_province_status" ON "provinces"("status");

-- CreateIndex
CREATE INDEX "idx_district_status" ON "districts"("status");

-- CreateIndex
CREATE INDEX "idx_subdistrict_status" ON "subdistricts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_code_key" ON "organizations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "idx_org_code" ON "organizations"("code");

-- CreateIndex
CREATE INDEX "idx_org_slug" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "idx_org_name" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "idx_org_country" ON "organizations"("country_id");

-- CreateIndex
CREATE INDEX "idx_org_province" ON "organizations"("province_id");

-- CreateIndex
CREATE INDEX "idx_org_district" ON "organizations"("district_id");

-- CreateIndex
CREATE INDEX "idx_org_subdistrict" ON "organizations"("subdistrict_id");

-- CreateIndex
CREATE INDEX "idx_org_status" ON "organizations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uk_store_org_code" ON "stores"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "uk_store_org_slug" ON "stores"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "idx_store_org" ON "stores"("organization_id");

-- CreateIndex
CREATE INDEX "idx_store_code" ON "stores"("code");

-- CreateIndex
CREATE INDEX "idx_store_slug" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "idx_store_name" ON "stores"("name");

-- CreateIndex
CREATE INDEX "idx_store_country" ON "stores"("country_id");

-- CreateIndex
CREATE INDEX "idx_store_province" ON "stores"("province_id");

-- CreateIndex
CREATE INDEX "idx_store_district" ON "stores"("district_id");

-- CreateIndex
CREATE INDEX "idx_store_subdistrict" ON "stores"("subdistrict_id");

-- CreateIndex
CREATE INDEX "idx_store_status" ON "stores"("status");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_subdistrict_id_fkey" FOREIGN KEY ("subdistrict_id") REFERENCES "subdistricts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_subdistrict_id_fkey" FOREIGN KEY ("subdistrict_id") REFERENCES "subdistricts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
