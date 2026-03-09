
import { prisma } from "../../prisma/db"
import { requireAuth } from "./token-store"

export async function getUserFromToken() {
  const token = await requireAuth()

  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: {
          token: token.access_token
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user
}