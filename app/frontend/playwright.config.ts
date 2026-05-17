import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read from default ".env" file.
dotenv.config({ path: path.resolve(__dirname, '.env') });
// Override with ".env.test" if it exists.
dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true });

const backendDir = path.resolve(__dirname, '../backend');
const backendBaseURL = process.env.E2E_BACKEND_URL || 'http://127.0.0.1:8000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Capture console logs
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: [
    {
      command:
        'python manage.py migrate --noinput && python manage.py seed_data && python manage.py runserver 127.0.0.1:8000',
      url: `${backendBaseURL}/admin/login/`,
      cwd: backendDir,
      env: {
        ...process.env,
        DEBUG: process.env.DEBUG || 'True',
        ALLOWED_HOSTS: process.env.ALLOWED_HOSTS || '127.0.0.1,localhost',
        DATABASE_URL: process.env.DATABASE_URL || '',
        REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379/0',
      },
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5173',
      cwd: __dirname,
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
