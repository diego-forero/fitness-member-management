import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const envFileName = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

config({
  path: path.resolve(__dirname, `../../${envFileName}`),
});

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});