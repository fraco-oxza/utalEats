import express, { Express } from "express";
import { MongoClient } from "mongodb";
import morgan from "morgan";
import { readFile } from "fs/promises";

const app: Express = express();
const port = process.env.PORT || 3000;

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("Database URL is not defined");
}

const client = new MongoClient(uri);

async function seedDatabase() {
  // Check if the database is already seeded
  const db = client.db("store");
  const collection = db.collection("stores");
  const stores = await collection.find({}).toArray();
  if (stores.length > 0) {
    return;
  }

  const newStores = JSON.parse(
    await readFile("src/initialStores.json", "utf-8")
  );
  console.log(newStores);

  await collection.insertMany(newStores);
}

// Check connection
client
  .connect()
  .then(() => {
    console.info("Database connected");
    seedDatabase();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

app.use(express.json());
app.use(morgan("dev"));

app.get("/store", async (req, res) => {
  const cityName = req.query.cityName;

  const db = client.db("store");
  const collection = db.collection("stores");

  const query = cityName ? { cityName } : {}; // If cityName is provided, filter by cityName, else return all
  const options = {};

  const stores = await collection.find(query, options).toArray();

  const response = stores.map((store) => ({
    storeId: store.storeId,
    storeName: store.storeName,
    imagePath: store.image,
  }));

  res.json(response);
});

app.get("/product", async (req, res) => {
  const storeIdRaw = req.query.storeId as string;

  if (storeIdRaw === undefined) {
    res.status(400).send("storeId is required");
    return;
  }

  const storeId = parseInt(storeIdRaw);
  console.log(storeId);

  const db = client.db("store");
  const collection = db.collection("stores");

  const query = { storeId };
  const options = {};

  const store = await collection.findOne(query, options);

  if (!store) {
    res.status(404).send("Store not found");
    return;
  }

  res.json(store.products);
});

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
