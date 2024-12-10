import {
  IOrder,
  IOrderFilter,
  IOrderCreateResponse,
} from "./domain-interfaces";
import { OrderRepository } from "./repositories";

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(
    orderData: Omit<IOrder, "orderId">
  ): Promise<IOrderCreateResponse> {
    // Validaciones adicionales de negocio pueden ir aquí
    const completeOrder: IOrder = {
      ...orderData,
      orderId: crypto.randomUUID(),
    };

    return this.orderRepository.createOrder(completeOrder);
  }

  async getOrders(filter: IOrderFilter): Promise<IOrder[]> {
    // Validaciones o transformaciones de filtro pueden ir aquí
    return this.orderRepository.findOrders(filter);
  }
}
