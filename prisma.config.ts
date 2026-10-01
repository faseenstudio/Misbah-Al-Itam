import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (session) connection; the app itself uses the pooled
    // DATABASE_URL at runtime. Falls back to DATABASE_URL for local development.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
