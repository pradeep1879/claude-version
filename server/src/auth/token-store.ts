import { promises as fs } from "fs";
import chalk from "chalk";
import { CONFIG_DIR, TOKEN_FILE } from "../config/path";

export type Token = {
  access_token: string;
  refresh_token?: string;
  expires_at?: string | null;
};

/**
 * Reads stored CLI token
 */
export const getStoredToken = async (): Promise<Token | null> => {
  try {
    const data = await fs.readFile(TOKEN_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
};

/**
 * Stores OAuth token locally
 */
export const storeToken = async (token: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}) => {
  await fs.mkdir(CONFIG_DIR, { recursive: true });

  const tokenData: Token = {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : null,
  };

  await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
};

/**
 * Clears stored token
 */
export const clearStoredToken = async (): Promise<boolean> => {
  try {
    await fs.access(TOKEN_FILE);
    await fs.unlink(TOKEN_FILE);
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if token expired
 */
export const isTokenExpired = async (): Promise<boolean> => {
  const token = await getStoredToken();

  if (!token || !token.expires_at) return true;

  return new Date(token.expires_at).getTime() < Date.now();
};

/**
 * Ensures CLI is authenticated
 */
export const requireAuth = async (): Promise<Token> => {
  const token = await getStoredToken();

  if (!token) {
    console.log(chalk.red("❌ Not logged in."));
    console.log(chalk.gray("Run: orbital login\n"));
    process.exit(1);
  }

  const expired = await isTokenExpired();

  if (expired) {
    console.log(chalk.yellow("⚠️ Session expired."));
    console.log(chalk.gray("Run: orbital login\n"));
    process.exit(1);
  }

  return token;
};