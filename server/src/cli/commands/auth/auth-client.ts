import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";


export function createClient(serverUrl: string) {
  return createAuthClient({
    baseURL: serverUrl,
    plugins: [deviceAuthorizationClient()],
  });
}