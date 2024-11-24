import express, { Express } from "express";
import { db, runMigration } from "./db/connection";
import argon2 from "argon2";
import { accountTable } from "./db/schema";
import { and, eq } from "drizzle-orm";

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

app.post("/account/login", async (req, res) => {
  const body: {
    email: string;
    password: string;
  } = req.body;

  const account = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.email, body.email));

  if (account.length === 0) {
    res.send({});
  }

  if (await argon2.verify(account[0].passwordHash, body.password)) {
    res.send({ accountId: account[0].id });
    return;
  }

  res.send({});
});

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
