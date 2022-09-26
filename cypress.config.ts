import { defineConfig } from "cypress";
import emailAccount from "cypress/plugins";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return emailAccount(on, config)
    },
  },
});
