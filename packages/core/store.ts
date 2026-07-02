export type StoreID = string;

export interface Store {
  id: StoreID;
  name: string;
  platform: "SHOPEE" | "LAZADA" | "TIKTOK" | "MANUAL";
  createdAt: Date;
}