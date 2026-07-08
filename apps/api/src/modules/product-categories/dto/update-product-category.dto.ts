export class UpdateProductCategoryDto {
  parentId?: string | null;
  code?: string;
  name?: string;
  description?: string | null;
  sortOrder?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}
