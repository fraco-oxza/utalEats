export interface Product {
  product: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: string;
  accountId: string;
  storeId: string;
  products: Product[];
}
