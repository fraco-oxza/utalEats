import express, { Express } from "express";
import { MongoClient } from "mongodb";
import morgan from "morgan";
import { z } from "zod";

const app: Express = express();
const port = process.env.PORT || 3000;

const uri = process.env.DATABASE_URL;

const OrderSchema = z.object({
  accountId: z.string(),
  storeId: z.string(),
  products: z.array(
    z.object({
      product: z.string(),
      quantity: z.number(),
    })
  ),
});

if (!uri) {
  throw new Error("Database URL is not defined");
}

const client = new MongoClient(uri);

// Check connection
client
  .connect()
  .then(() => {
    console.info("Database connected");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

app.use(express.json());
app.use(morgan("dev"));

app.post("/order", (req, res) => {
  let payload: typeof OrderSchema._type;

  try {
    payload = OrderSchema.parse(req.body);
  } catch (err) {
    // Response what is the error with the data
    res.status(400).send(err);

    return;
  }

  const db = client.db("order");
  const collection = db.collection("orders");

  collection
    .insertOne(payload)
    .then(() => {
      res.status(201).send("Order created");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal server error");
    });
});

app.get("/order", (req, res) => {
  const accountId = req.query.accountId as string;

  const db = client.db("order");
  const collection = db.collection("orders");

  collection
    .find({ accountId })
    .toArray()
    .then((orders) => {
      res.status(200).send(orders);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal server error");
    });
});

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
