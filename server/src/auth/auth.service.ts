
import { prisma } from "../../prisma/db";
import { getStoredToken } from "./token-store";



export async function getUserFromToken() {
  const token = await getStoredToken();

  if (!token) throw new Error("Not authenticated");

  return prisma.user.findFirst({
    where: {
      sessions: {
        some: { token: token.access_token },
      },
    },
  });
}