import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'url'

const frontendDir = path.dirname(fileURLToPath(import.meta.url))
const frontendEnv = path.resolve(frontendDir, '.env')
const frontendTestEnv = path.resolve(frontendDir, '.env.test')
const backendDir = path.resolve(frontendDir, '../backend')

loadEnv({ path: frontendEnv, override: false })
loadEnv({ path: frontendTestEnv, override: true })

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:5173'
const backendBaseURL = process.env.E2E_BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never', outputFolder: 'playwright-quality-report' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'python manage.py migrate --noinput && python manage.py seed_data && python manage.py runserver 127.0.0.1:8000',
      cwd: backendDir,
      url: `${backendBaseURL}/admin/login/`,
      reuseExistingServer: false,
      timeout: 120 * 1000,
      env: {
        ...process.env,
        DEBUG: process.env.DEBUG || 'True',
        ALLOWED_HOSTS: process.env.ALLOWED_HOSTS || '127.0.0.1,localhost',
        DATABASE_URL: process.env.DATABASE_URL || '',
        REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379/0',
      },
    },
    {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5173 --strictPort',
      cwd: frontendDir,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 240 * 1000,
      env: {
        ...process.env,
        VITE_BACKEND_URL: backendBaseURL,
      },
    },
  ],
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
})
