export class CreateCustomerDto {
  organizationId!: string;
  customerGroupId?: string;
  code!: string;
  name!: string;
  taxId?: string;
  branch?: string;
  contactPerson?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  creditDays?: number;
  creditLimit?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
