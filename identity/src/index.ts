import express, { Express } from "express";
import { db, runMigration } from "./db/connection";
import argon2 from "argon2";
import { accountTable, profileTable } from "./db/schema";
import { eq } from "drizzle-orm";

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

  await db.insert(accountTable).values({
    ...body,
    passwordHash: await argon2.hash(body.password),
  });

  const result = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.email, body.email));

  const account = result[0];

  const newProfile: typeof profileTable.$inferInsert = {
    ...body,
    accountId: account.id,
  };

  await db.insert(profileTable).values(newProfile);

  res.send(account);
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

app.get("/profile", async (req, res) => {
  const accountId = parseInt(req.query.accountId as string);

  const profile = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.accountId, accountId));

  res.send(profile[0]);
});

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
