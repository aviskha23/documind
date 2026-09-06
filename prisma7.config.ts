import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  experimental: {
    externalTables: true,
  },

  migrations: {
    path: "prisma/migrations",
    initShadowDb: `
      CREATE EXTENSION IF NOT EXISTS vector;
    `,
  },

  datasource: {
    url: process.env["DATABASE_URL"],
  },
});