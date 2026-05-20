import dotenv from "dotenv";
import path from "node:path";

const serverRootEnvPath = path.resolve(import.meta.dir, "../../.env");

dotenv.config({ path: serverRootEnvPath, quiet: true });
dotenv.config({ quiet: true, override: false });

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseNumber(process.env.PORT, 3001),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  serverUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  databaseUrl: process.env.DATABASE_URL ?? "",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? "",
  githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
  googleModel: process.env.ORBITAL_MODAL ?? "gemini-2.5-flash",
  redisHost: process.env.REDIS_HOST ?? "127.0.0.1",
  redisPort: parseNumber(process.env.REDIS_PORT, 6379),
  redisPassword: process.env.REDIS_PASSWORD ?? "",
};

export const isProduction = env.nodeEnv === "production";
