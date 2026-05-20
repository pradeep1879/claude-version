#!/usr/bin/env bun

import chalk from "chalk";
import { Command } from "commander";
import { loginAction, logoutAction, whoamiAction } from "./commands/auth/login.command";
import { wakeUpAction } from "./commands/wakeup.command";
import { renderAppBanner } from "./components/status";

async function main() {
  console.log(renderAppBanner());
  console.log(chalk.dim("A premium terminal workspace for Orbital.\n"));

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
