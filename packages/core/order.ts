export type OrderID = string;

export interface Order {
  id: OrderID;
  storeId: string;
  items: OrderItem[];
  status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}