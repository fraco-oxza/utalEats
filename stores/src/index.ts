import express, { Express } from "express";
import { MongoClient } from "mongodb";
import morgan from "morgan";

const app: Express = express();
const port = process.env.PORT || 3000;

const uri = process.env.DATABASE_URL;

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

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
