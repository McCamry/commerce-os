export class UpdateStoreDto {
  code?: string;
  name?: string;
  slug?: string;
  countryId?: string;
  provinceId?: string | null;
  districtId?: string | null;
  subdistrictId?: string | null;
  taxId?: string | null;
  contactPerson?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email?: string | null;
  address1?: string | null;
  address2?: string | null;
  remark?: string | null;
  timezone?: string;
  currency?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
