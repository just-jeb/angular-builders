import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    setupNodeEvents() {
      // implement node event listeners here
    },
    specPattern: 'e2e/src/**/*.e2e-spec.ts',
    baseUrl: 'http://localhost:5002',
    supportFile: false,
  },
});
