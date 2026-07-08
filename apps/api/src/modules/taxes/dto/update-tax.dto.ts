export class UpdateTaxDto {
  code?: string;
  name?: string;
  rate?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
