import { execSync } from 'node:child_process'

export function runCommand(command: string): string | null {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim()
  } catch (error) {
    const typedError = error as Error
    console.error(typedError.message)
    return null
  }
}
