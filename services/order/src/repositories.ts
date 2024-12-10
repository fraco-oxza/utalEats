import {
  IOrder,
  IOrderFilter,
  IOrderCreateResponse,
} from "./domain-interfaces";

export abstract class OrderRepository {
  /**
   * Crea una nueva orden
   * @param order Datos de la orden
   * @returns Respuesta de creación de orden
   */
  abstract createOrder(order: IOrder): Promise<IOrderCreateResponse>;

  /**
   * Busca órdenes según filtros
   * @param filter Filtros de búsqueda
   * @returns Lista de órdenes
   */
  abstract findOrders(filter: IOrderFilter): Promise<IOrder[]>;
}
