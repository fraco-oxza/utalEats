import { OrderController } from "./express-controler";

// Uso
const uri = process.env.DATABASE_URL;
if (!uri) {
  throw new Error("Database URL is not defined");
}

const orderController = new OrderController(uri);
orderController.start();
