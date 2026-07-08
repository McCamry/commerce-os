export class CreateBrandDto {
  organizationId!: string;
  code!: string;
  name!: string;
  logo?: string;
  website?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
