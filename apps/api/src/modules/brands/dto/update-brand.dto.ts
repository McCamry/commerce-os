export class UpdateBrandDto {
  code?: string;
  name?: string;
  logo?: string | null;
  website?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}
