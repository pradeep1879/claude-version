import os from 'os'
import path from 'path'


export const CONFIG_DIR = path.join(os.homedir(), ".new-orbital-cli")
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json")