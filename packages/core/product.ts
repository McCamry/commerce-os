export type ProductID = string;

export interface Product {
  id: ProductID;
  name: string;
  description?: string;
  skuPrefix: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}