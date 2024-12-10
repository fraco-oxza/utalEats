import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export const db = drizzle(process.env.DATABASE_URL!);

db.execute("SELECT 1").catch((err) => {
  console.error(err);
  process.exit(1);
});

// Run migrations
export const runMigration = () =>
  migrate(db, { migrationsFolder: "./drizzle" }).then(
    () => {
      console.log("Migrations complete");
    },
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
