import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
import path from 'path'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

config({ path: path.resolve(__dirname, '.env') })

const BASE_URL = `http://localhost:${process.env.PORT}`

export default defineConfig({
  testDir: './playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'yarn run start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe'
  }
})
