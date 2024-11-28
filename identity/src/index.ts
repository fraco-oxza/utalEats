import express, { Express } from "express";
import morgan from "morgan";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import cors from "cors";

import { db, runMigration } from "./db/connection";
import { accountTable, profileTable } from "./db/schema";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

runMigration();

app.post("/account/register", async (req, res) => {
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.name ||
    !req.body.phone ||
    !req.body.address ||
    !req.body.city
  ) {
    res
      .status(400)
      .send("email, password, name, phone, address, and city are required");
    return;
  }

  const body: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
    city: string;
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
  if (!req.body.email || !req.body.password) {
    res.status(400).send("email and password are required");
    return;
  }

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
    return;
  }

  if (await argon2.verify(account[0].passwordHash, body.password)) {
    res.send({ accountId: account[0].id });
    return;
  }

  res.send({});
});

app.get("/profile", async (req, res) => {
  try {
    if (!req.query.accountId) {
      res.status(400).send("accountId is required");
      return;
    }

    const accountIdString = req.query.accountId as string;

    if (!accountIdString.match(/^\d+$/)) {
      res.status(400).send("accountId must be a number");
      return;
    }

    const accountId = parseInt(accountIdString, 10);

    const profile = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.accountId, accountId));

    if (profile.length === 0) {
      res.status(404).send("Profile not found");
      return;
    }

    res.send(profile[0]);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.error(error);
  }
});

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
