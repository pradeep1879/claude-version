#!/usr/bin/env bun

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import { Command } from "commander";
import { loginAction, logoutAction, whoamiAction } from "./commands/auth/login";
import { wakeUpAction } from "./commands/ai-command/wake.command";

dotenv.config();

async function main() {
  console.log(
    chalk.cyan(
      figlet.textSync("Orbital CLI", {
        font: "Standard",
        horizontalLayout: "default",
      })
    )
  );

  console.log(chalk.gray("A CLI based AI Tool\n"));

  const program = new Command("orbital");

  program
    .version("0.0.1")
    .description("Orbital CLI - A CLI Based AI Tool!");

  // LOGIN COMMAND
  program
    .command("login")
    .description("Login to Orbital")
    .action(loginAction);
  program
    .command("logout")
    .description("Logout from Orbital")
    .action(logoutAction);
  program
    .command("whoami")
    .description("who am i")
    .action(whoamiAction);
  program
    .command("wakeup")
    .description("Chat with AI")
    .action(wakeUpAction); 
    
    

  program.action(() => {
    program.help();
  });

  program.parse();
}

main().catch((err) => {
  console.error(chalk.red("Error while running orbital CLI:"), err);
  process.exit(1);
});