import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const accountTable = pgTable("account", {
  id: serial().primaryKey(),
  email: text().unique().notNull(),
  passwordHash: text().notNull(),
});

export const profileTable = pgTable("profile", {
  id: serial().primaryKey(),
  accountId: serial()
    .notNull()
    .references(() => accountTable.id),
  name: text().notNull(),
  phone: text().notNull(),
});
