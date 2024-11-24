import express, { Express } from "express";
import { db, runMigration } from "./db/connection";

const app: Express = express();
const port = process.env.PORT || 3000;

runMigration();

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
