import chalk from "chalk"
import boxen from "boxen"
import { marked } from "marked"
//@ts-ignore
import { markedTerminal } from "marked-terminal"

/**
 * Configure markdown renderer for terminal
 */
marked.use(
  markedTerminal({
    code: chalk.cyan,
    blockquote: chalk.gray.italic,
    heading: chalk.green.bold,
    firstHeading: chalk.magenta.bold,
    strong: chalk.bold,
    em: chalk.italic,
    codespan: chalk.yellow.bgBlack,
    link: chalk.blue.underline
  })
)

/**
 * Render user message
 */
export function renderUserMessage(message: string) {
  console.log(
    boxen(chalk.white(message), {
      padding: 1,
      margin: { left: 2, top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "blue",
      title: "👤 You",
      titleAlignment: "left"
    })
  )
}

/**
 * Render assistant message (formatted markdown)
 */
export function renderAssistantMessage(message: string) {
  const rendered = marked.parse(message)

  console.log(
    //@ts-ignore
    boxen(rendered.trim(), {
      padding: 1,
      margin: { left: 2, bottom: 1 },
      borderStyle: "round",
      borderColor: "green",
      title: "🤖 Assistant",
      titleAlignment: "left"
    })
  )
}

/**
 * Streaming AI response
 */
export function streamAssistantStart() {
  console.log("\n" + chalk.green.bold("🤖 Assistant"))
  console.log(chalk.gray("─".repeat(60)))
}

export function streamAssistantChunk(chunk: string) {
  process.stdout.write(chalk.white(chunk))
}

export function streamAssistantEnd() {
  console.log("\n" + chalk.gray("─".repeat(60)) + "\n")
}