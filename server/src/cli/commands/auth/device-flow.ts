import yoctoSpinner from "yocto-spinner";
import chalk from "chalk";

export async function pollForToken(
  authClient: any,
  deviceCode: string,
  clientId: string,
  interval: number
) {
  const spinner = yoctoSpinner({ text: "Waiting for authorization..." });

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const { data, error } = await authClient.device.token({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: deviceCode,
          client_id: clientId,
        });

        if (data?.access_token) {
          spinner.stop();
          resolve(data);
          return;
        }

        if (error?.error === "authorization_pending") {
          spinner.start();
        } else if (error?.error === "slow_down") {
          interval += 5;
        } else {
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