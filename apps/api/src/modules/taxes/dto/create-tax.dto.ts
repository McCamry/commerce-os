export class CreateTaxDto {
  organizationId!: string;
  code!: string;
  name!: string;
  rate!: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
