export class UpdateUnitDto {
  code?: string;
  name?: string;
  symbol?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
