import { Body, Controller, Delete, Get, Put, Query } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { UpsertTranslationDto } from './dto/upsert-translation.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Get()
  getAll(@CurrentUser('organizationId') organizationId: string) {
    return this.translationsService.getAll(organizationId);
  }

  @Put()
  upsert(
    @Body() dto: UpsertTranslationDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.translationsService.upsert(organizationId, dto);
  }

  @Delete()
  remove(
    @CurrentUser('organizationId') organizationId: string,
    @Query('locale') locale: string,
    @Query('key') key: string,
  ) {
    return this.translationsService.remove(organizationId, locale, key);
  }
}
