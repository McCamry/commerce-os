export class CreateStoreDto {
  organizationId!: string;
  code!: string;
  name!: string;
  slug!: string;
  countryId!: string;
  provinceId?: string;
  districtId?: string;
  subdistrictId?: string;
  taxId?: string;
  contactPerson?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  address1?: string;
  address2?: string;
  remark?: string;
  timezone?: string;
  currency?: string;
}
