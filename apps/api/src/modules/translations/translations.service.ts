import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertTranslationDto } from './dto/upsert-translation.dto';

@Injectable()
export class TranslationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns this organization's translation overrides grouped by locale:
   * { th: { "customers.title": "ลูกค้า" }, en: { ... } }. The frontend merges
   * these over the in-code base dictionaries.
   */
  async getAll(
    organizationId: string,
  ): Promise<Record<string, Record<string, string>>> {
    const rows = await this.prisma.translation.findMany({
      where: { organizationId },
    });

    const byLocale: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      (byLocale[row.locale] ??= {})[row.key] = row.value;
    }
    return byLocale;
  }

  upsert(organizationId: string, dto: UpsertTranslationDto) {
    return this.prisma.translation.upsert({
      where: {
        organizationId_locale_key: {
          organizationId,
          locale: dto.locale,
          key: dto.key,
        },
      },
      update: { value: dto.value },
      create: {
        organizationId,
        locale: dto.locale,
        key: dto.key,
        value: dto.value,
      },
    });
  }

  async remove(organizationId: string, locale: string, key: string) {
    await this.prisma.translation.deleteMany({
      where: { organizationId, locale, key },
    });
    return { success: true };
  }
}
