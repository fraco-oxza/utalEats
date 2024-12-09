import { MongoClient, Db } from "mongodb";
import { randomUUID } from "crypto";
import { OrderSchema } from "./domain-interfaces";
import { OrderRepository } from "./repositories";
import {
  IOrder,
  IOrderFilter,
  IOrderCreateResponse,
} from "./domain-interfaces";

export class MongoOrderRepository extends OrderRepository {
  private client: MongoClient;
  private db: Db | null = null;

  constructor(uri: string) {
    super();
    if (!uri) {
      throw new Error("Database URL is not defined");
    }
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db("order");
    console.info("Database connected");
  }

  async createOrder(orderData: IOrder): Promise<IOrderCreateResponse> {
    const order = {
      ...orderData,
      orderId: randomUUID(),
    };

    // Validar con Zod antes de insertar
    OrderSchema.parse(order);

    const collection = this.db!.collection("orders");
    await collection.insertOne(order);

    return {
      message: "Order created",
      orderId: order.orderId,
    };
  }

  async findOrders(filter: IOrderFilter): Promise<IOrder[]> {
    const collection = this.db!.collection("orders");
    return collection.find(filter).toArray() as unknown as Promise<IOrder[]>;
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
