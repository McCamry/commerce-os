export class UpdateCustomerDto {
  customerGroupId?: string | null;
  code?: string;
  name?: string;
  taxId?: string | null;
  branch?: string | null;
  contactPerson?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email?: string | null;
  creditDays?: number;
  creditLimit?: number | null;
  status?: 'ACTIVE' | 'INACTIVE';
}
