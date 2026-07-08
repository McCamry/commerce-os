export class CreateUnitDto {
  organizationId!: string;
  code!: string;
  name!: string;
  symbol!: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
