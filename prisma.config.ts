import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./packages/database/prisma/schema.prisma",

  migrations: {
    path: "./packages/database/prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});