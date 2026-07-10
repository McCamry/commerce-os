export class CreateVendorDto {
  organizationId!: string;
  code!: string;
  name!: string;
  taxId?: string;
  branch?: string;
  contactPerson?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  website?: string;
  creditDays?: number;
  creditLimit?: number;
  paymentTerm?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
