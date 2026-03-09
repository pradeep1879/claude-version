import { intro, outro, confirm, isCancel, cancel } from "@clack/prompts";
import chalk from "chalk";
import open from "open";
import yoctoSpinner from "yocto-spinner";



import {
  clearStoredToken,
  getStoredToken,
  requireAuth,
  storeToken,
} from "../../../auth/token-store";
import { prisma } from "../../../../prisma/db";
import { createClient } from "../../../auth/auth.client";
import { pollForToken } from "../../../auth/auth.device-flow";



const SERVER_URL = "http://localhost:3001";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;

/**
 * Login using OAuth device flow
 */
export async function loginAction() {
  if (!CLIENT_ID) {
    console.error(chalk.red("Missing GITHUB_CLIENT_ID in environment"));
    process.exit(1);
  }

  intro(chalk.bold("🔐 Orbital CLI Login"));

  const authClient = createClient(SERVER_URL);

  const spinner = yoctoSpinner({
    text: "Requesting device authorization...",
  }).start();

  try {
    const { data, error } = await authClient.device.code({
      client_id: CLIENT_ID,
      scope: "openid profile email",
    });

    spinner.success("Device authorization requested");

    if (error || !data) {
      console.error(chalk.red("Failed to request device authorization"));
      process.exit(1);
    }

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      interval,
      expires_in,
    } = data;

    console.log(chalk.cyan("\nDevice Authorization Required\n"));

    console.log(
      `Visit: ${chalk.blue(
        verification_uri_complete || verification_uri
      )}`
    );

    console.log(`Code: ${chalk.green.bold(user_code)}\n`);

    const shouldOpen = await confirm({
      message: "Open browser automatically?",
      initialValue: true,
    });

    if (isCancel(shouldOpen)) process.exit(0);

    if (shouldOpen) {
      await open(verification_uri_complete || verification_uri);
    }

    console.log(
      chalk.gray(
        `Waiting for authorization (expires in ${Math.floor(
          expires_in / 60
        )} minutes)...\n`
      )
    );

    const token = await pollForToken(
      //@ts-ignore
      authClient,
      device_code,
      CLIENT_ID,
      interval ?? 5
    );

    await storeToken(token);

    outro(chalk.green("Login successful!"));
  } catch (err) {
    spinner.stop();
    console.error(chalk.red("Login failed"), err);
    process.exit(1);
  }
}

/**
 * Logout command
 */
export async function logoutAction() {
  intro(chalk.bold("👋 Logout"));

  const token = await getStoredToken();

  if (!token) {
    console.log(chalk.yellow("You're not logged in."));
    process.exit(0);
  }

  const shouldLogout = await confirm({
    message: "Are you sure you want to logout?",
    initialValue: false,
  });

  if (isCancel(shouldLogout) || !shouldLogout) {
    cancel("Logout cancelled");
    process.exit(0);
  }

  try {
    const cleared = await clearStoredToken();

    if (cleared) {
      outro(chalk.green("✅ Successfully logged out!"));
    } else {
      console.log(chalk.yellow("⚠️ Could not clear token file."));
    }
  } catch (err) {
    console.error(chalk.red("Logout failed"), err);
  }
}

/**
 * Show current logged-in user
 */
export async function whoamiAction() {
  const token = await requireAuth();

  try {
    const user = await prisma.user.findFirst({
      where: {
        sessions: {
          some: { token: token.access_token },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    console.log(
      chalk.bold.greenBright(`
👤 User: ${user?.name}
📧 Email: ${user?.email}
🆔 ID: ${user?.id}
`)
    );
  } catch (err) {
    console.error(chalk.red("Failed to fetch user info"), err);
  }
}