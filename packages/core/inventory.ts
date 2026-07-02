export type InventoryID = string;

export interface Inventory {
  id: InventoryID;
  productId: string;
  warehouseId: string;
  quantity: number;
  reserved: number;
  updatedAt: Date;
}