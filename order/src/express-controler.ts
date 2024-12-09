import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import { OrderService } from "./application-services";
import { MongoOrderRepository } from "./mongodb-repository";
import { IOrder, OrderSchema } from "./domain-interfaces";

export class OrderController {
  private app: Express;
  private orderService: OrderService;
  private orderRepository: MongoOrderRepository;

  constructor(uri: string) {
    this.app = express();
    this.orderRepository = new MongoOrderRepository(uri);
    this.orderService = new OrderService(this.orderRepository);

    this.configureMiddlewares();
    this.registerRoutes();
  }

  private configureMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(morgan("dev"));
  }

  private registerRoutes(): void {
    this.app.post("/order", this.handleCreateOrder.bind(this));
    this.app.get("/order", this.handleGetOrders.bind(this));
  }

  private async handleCreateOrder(req: Request, res: Response): Promise<void> {
    try {
      // Omitir orderId ya que será generado en el servicio
      const { orderId, ...orderData } = req.body;

      const result = await this.orderService.createOrder(orderData);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async handleGetOrders(req: Request, res: Response): Promise<void> {
    try {
      const accountId = req.query.accountId as string;
      const orders = await this.orderService.getOrders({ accountId });
      res.status(200).json(orders);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown): void {
    console.error(error);

    if (error instanceof Error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Validation error", details: error });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }

  async start(port: number = 3000): Promise<void> {
    await this.orderRepository.connect();

    this.app.listen(port, () => {
      console.info(`Server running on port ${port}`);
    });
  }
}
