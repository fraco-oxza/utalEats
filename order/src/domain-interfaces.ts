import { z } from "zod";

export const ProductSchema = z.object({
  product: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
});

export const OrderSchema = z.object({
  orderId: z.string().uuid(),
  accountId: z.string(),
  storeId: z.string(),
  products: z.array(ProductSchema),
});

export interface IProduct {
  product: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  orderId: string;
  accountId: string;
  storeId: string;
  products: IProduct[];
}

export interface IOrderFilter {
  accountId?: string;
  storeId?: string;
}

export interface IOrderCreateResponse {
  message: string;
  orderId: string;
}
