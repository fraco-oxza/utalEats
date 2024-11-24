import express, { Express } from "express";
import { db, runMigration } from "./db/connection";
import argon2 from "argon2";
import { accountTable } from "./db/schema";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

runMigration();

app.post("/account/register", async (req, res) => {
  const body: {
    email: string;
    password: string;
    name: string;
    phone: string;
  } = req.body;

  const newAccount: typeof accountTable.$inferInsert = {
    ...body,
    passwordHash: await argon2.hash(body.password),
  };

  db.insert(accountTable)
    .values(newAccount)
    .then(() => res.send(newAccount))
    .catch((e) => {
      if (
        e.message.includes("duplicate key value violates unique constraint")
      ) {
        res.status(400).send("Email already exists");
      } else {
        console.error(e);
        res.status(500).send("Internal server error");
      }
    });
});

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
