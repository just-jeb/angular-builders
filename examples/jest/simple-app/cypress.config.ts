import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    setupNodeEvents(on, config) {},
    specPattern: 'e2e/src/**/*.e2e-spec.ts',
    baseUrl: 'http://localhost:4200',
    supportFile: false,
  },
});
