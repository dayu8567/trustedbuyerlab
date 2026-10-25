import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://trustedbuyerlab.com",
  trailingSlash: "always",
  compressHTML: true,
  build: {
    format: "directory",
    inlineStylesheets: "auto",
  },
  devToolbar: {
    enabled: false,
  },
});
