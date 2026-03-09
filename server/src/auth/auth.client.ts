import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

/**
 * Creates BetterAuth client configured for CLI device authorization
 */
export function createClient(serverUrl: string) {
  return createAuthClient({
    baseURL: serverUrl,
    plugins: [deviceAuthorizationClient()],
  });
}