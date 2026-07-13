-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translations_organization_id_locale_idx" ON "translations"("organization_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "uk_translation_org_locale_key" ON "translations"("organization_id", "locale", "key");

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
