import { createAuthClient } from 'better-auth/react'
import { deviceAuthorizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
  basePath: "/api/auth",
  fetchOptions:{
    credentials: "include",
  },
  plugins: [
    deviceAuthorizationClient()
  ]
})