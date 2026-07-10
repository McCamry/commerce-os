export class UpdateVendorDto {
  code?: string;
  name?: string;
  taxId?: string | null;
  branch?: string | null;
  contactPerson?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email?: string | null;
  website?: string | null;
  creditDays?: number;
  creditLimit?: number | null;
  paymentTerm?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}
