import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { deviceAuthorization } from "better-auth/plugins";
import { prisma } from "../../prisma/db";
import { env } from "../config/env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "/api/auth",
  trustedOrigins: [env.clientUrl],
  secret: env.betterAuthSecret || undefined,
  baseURL: env.serverUrl,
  plugins: [
    deviceAuthorization({
      expiresIn: "30m",
      interval: "5s",
    }),
  ],
  socialProviders: {
    github: {
      clientId: env.githubClientId,
      clientSecret: env.githubClientSecret,
    },
  },
});
