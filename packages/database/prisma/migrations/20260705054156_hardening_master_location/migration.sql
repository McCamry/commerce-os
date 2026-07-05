/*
  Warnings:

  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `District` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Province` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subdistrict` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "public"."District" DROP CONSTRAINT "District_provinceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Province" DROP CONSTRAINT "Province_countryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subdistrict" DROP CONSTRAINT "Subdistrict_districtId_fkey";

-- DropTable
DROP TABLE "public"."Country";

-- DropTable
DROP TABLE "public"."District";

-- DropTable
DROP TABLE "public"."Province";

-- DropTable
DROP TABLE "public"."Store";

-- DropTable
DROP TABLE "public"."Subdistrict";

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "country_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subdistricts" (
    "id" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subdistricts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uk_country_code" ON "countries"("code");

-- CreateIndex
CREATE INDEX "idx_country_code" ON "countries"("code");

-- CreateIndex
CREATE INDEX "idx_country_name_th" ON "countries"("name_th");

-- CreateIndex
CREATE INDEX "idx_province_country" ON "provinces"("country_id");

-- CreateIndex
CREATE INDEX "idx_province_code" ON "provinces"("code");

-- CreateIndex
CREATE INDEX "idx_province_name_th" ON "provinces"("name_th");

-- CreateIndex
CREATE UNIQUE INDEX "uk_province_country_code" ON "provinces"("country_id", "code");

-- CreateIndex
CREATE INDEX "idx_district_province" ON "districts"("province_id");

-- CreateIndex
CREATE INDEX "idx_district_code" ON "districts"("code");

-- CreateIndex
CREATE INDEX "idx_district_name_th" ON "districts"("name_th");

-- CreateIndex
CREATE UNIQUE INDEX "uk_district_province_code" ON "districts"("province_id", "code");

-- CreateIndex
CREATE INDEX "idx_subdistrict_district" ON "subdistricts"("district_id");

-- CreateIndex
CREATE INDEX "idx_subdistrict_code" ON "subdistricts"("code");

-- CreateIndex
CREATE INDEX "idx_subdistrict_name_th" ON "subdistricts"("name_th");

-- CreateIndex
CREATE UNIQUE INDEX "uk_subdistrict_district_code" ON "subdistricts"("district_id", "code");

-- AddForeignKey
ALTER TABLE "provinces" ADD CONSTRAINT "provinces_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subdistricts" ADD CONSTRAINT "subdistricts_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
