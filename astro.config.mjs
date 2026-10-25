import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

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
  vite: {
    resolve: {
      alias: [
        {
          find: /^yaml$/,
          replacement: fileURLToPath(
            new URL("./node_modules/yaml/browser/index.js", import.meta.url),
          ),
        },
        {
          find: /^picomatch$/,
          replacement: fileURLToPath(
            new URL("./scripts/shims/picomatch.mjs", import.meta.url),
          ),
        },
      ],
    },
    ssr: {
      noExternal: ["yaml"],
    },
  },
});
