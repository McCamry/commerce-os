export class CreateProductCategoryDto {
  organizationId!: string;
  parentId?: string;
  code!: string;
  name!: string;
  description?: string;
  sortOrder?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
