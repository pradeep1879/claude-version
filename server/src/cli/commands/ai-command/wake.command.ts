import chalk from "chalk"
import { getStoredToken } from "../auth/token-store"
import yoctoSpinner from "yocto-spinner"
import { prisma } from "../../../../prisma/db"
import { select } from "@clack/prompts"
import { startChat } from "../../services/tools/chat-with-ai"

export const wakeUpAction = async () =>{
  const token = await getStoredToken()
  if(!token?.access_token){
    throw new Error(chalk.red("You are anot authenticated. Please login first"))
    return;
  }

  const spinner = yoctoSpinner({text: "Fetching user information..."})
  spinner.start();
  try {
    const user = await prisma.user.findFirst({
      where:{
        sessions:{
          some: {token: token.access_token}
        }
      },
      select:{name: true, id: true, image:true}
    })
    if(!user){
      throw new Error(chalk.red("User not found!!"))
    }
    spinner.stop();
    console.log(chalk.green(`Welcome back, ${user.name}!`))

    const choice = await select({
      message: "Select an option",
      options: [
        {
            value: "chat",
            label: "Chat",
            hint: "Simple caht with AI",
          },
          {
              value: "tool",
              label: "Tool Calling",
              hint: "Caht with tools (Google Search, Code Excecution)",
          },
          {
              value: "agent",
              label: "Agentic Mode",
              hint: "Advanced AI agent (Coming soon...)",
          },
      ]
    });

    switch(choice){
      case "chat":
        await startChat("chat")
        break;
      case "agent":
        console.log(chalk.green("Agent mode selected"));
        break;
      case "tool":
        console.log(chalk.green("Tool mode selected"));
        break;
    }

  } catch (error) {
    console.log(chalk.red("Error while wakping up",error))    
  }
}