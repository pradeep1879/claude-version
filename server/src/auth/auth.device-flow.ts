import type { createClient } from "./auth.client";
import yoctoSpinner from "yocto-spinner";

type DeviceTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

type AuthClient = ReturnType<typeof createClient>;
type DeviceTokenResult = {
  data?: DeviceTokenResponse | null;
  error?: {
    error?: string;
    error_description?: string;
  } | null;
};

/**
 * Polls the OAuth device endpoint until authorization completes
 */
export async function pollForToken(
  authClient: AuthClient,
  deviceCode: string,
  clientId: string,
  interval: number
): Promise<DeviceTokenResponse> {
  const spinner = yoctoSpinner({ text: "Waiting for authorization..." });

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const result = (await authClient.device.token({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: deviceCode,
          client_id: clientId,
        })) as DeviceTokenResult;
        const data = result.data ?? undefined;
        const error = result.error ?? undefined;

        if (data?.access_token) {
          spinner.stop();
          resolve(data);
          return;
        }

        if (error?.error === "authorization_pending") {
          spinner.start();
        } else if (error?.error === "slow_down") {
          interval += 5;
        } else if (error) {
          spinner.stop();
          reject(error);
          return;
        }
      } catch (err) {
        spinner.stop();
        reject(err);
        return;
      }

      setTimeout(poll, interval * 1000);
    };

    setTimeout(poll, interval * 1000);
  });
}
