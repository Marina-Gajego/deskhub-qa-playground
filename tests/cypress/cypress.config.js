const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: [
      'cypress/e2e/web/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/e2e/api/**/*.cy.{js,jsx,ts,tsx}',
    ],
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
  },
  env: {
    apiUrl: 'http://localhost:3001',
  },
});
