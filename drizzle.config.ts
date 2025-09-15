import type { Config } from "drizzle-kit";

export default {
	schema: "./db/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? ".data/sqlite.db",
	},
} satisfies Config;


