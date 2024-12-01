import express, { Express } from "express";
import morgan from "morgan";
import { eq } from "drizzle-orm";
import cors from "cors";

import { db, runMigration } from "./db/connection";
import { ratingTable } from "./db/schema";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

runMigration();

app.post("/", async (req, res) => {
  const { storeId, orderId, score, comment } = req.body;

  if (!storeId || !score || !orderId) {
    res.status(400).send("storeId and score are required");
    return;
  }

  await db
    .insert(ratingTable)
    .values({ storeId, orderId, score: parseFloat(score), comment });

  res.status(201).send();
});

app.get("/", async (req, res) => {
  if (!req.query.storeId) {
    res.status(400).send("storeId is required");
    return;
  }

  const storeId = req.query.storeId as string;

  const ratings = await db
    .select()
    .from(ratingTable)
    .where(eq(ratingTable.storeId, storeId));

  const averageRating = ratings.reduce(
    (acc, rating) => acc + rating.score / ratings.length,
    0.0
  );

  res.json({ averageRating, comments: ratings.map((r) => r.comment) });
});

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
