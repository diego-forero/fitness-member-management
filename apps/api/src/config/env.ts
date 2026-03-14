import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

const envFileName = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

config({
  path: path.resolve(__dirname, "../../../../", envFileName),
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;