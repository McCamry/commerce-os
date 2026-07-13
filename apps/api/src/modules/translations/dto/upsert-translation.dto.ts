import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpsertTranslationDto {
  @IsIn(['th', 'en'])
  locale!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  value!: string;
}
