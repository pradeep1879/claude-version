import { prisma } from "../../prisma/db";
import { getCacheValue, setCacheValue } from "../lib/redis";
import { getStoredToken, requireAuth } from "./token-store";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

const getUserByAccessToken = async (
  accessToken: string,
): Promise<AuthUser | null> => {
  const cacheKey = `session:${accessToken}`;
  const cachedUser = await getCacheValue<AuthUser>(cacheKey);

  if (cachedUser) {
    return cachedUser;
  }

  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: { token: accessToken },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    return null;
  }

  await setCacheValue(cacheKey, user, 3600);

  return user;
};

export const getUserFromToken = async (): Promise<AuthUser | null> => {
  const token = await getStoredToken();

  if (!token?.access_token) {
    throw new Error("Not authenticated");
  }

  return getUserByAccessToken(token.access_token);
};

export const requireUserFromToken = async (): Promise<AuthUser> => {
  const token = await requireAuth();
  const user = await getUserByAccessToken(token.access_token);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
