import express, { Express } from "express";

const app: Express = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
