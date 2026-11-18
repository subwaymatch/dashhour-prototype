import { defineConfig, defineWorker } from "cf/config";

// A static single-page app: no Worker code, and any address without a file gets index.html.
export default defineConfig({
  worker: defineWorker({
    name: "dashhour",
    compatibilityDate: "2026-10-28",
    assets: {
      notFoundHandling: "single-page-application",
    },
  }),
});
