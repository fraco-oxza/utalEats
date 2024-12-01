import { doublePrecision, pgTable, serial, text } from "drizzle-orm/pg-core";

export const ratingTable = pgTable("rating", {
  id: serial().primaryKey(),
  storeId: text().notNull(),
  orderId: text().notNull(),
  score: doublePrecision().notNull(),
  comment: text(),
});
