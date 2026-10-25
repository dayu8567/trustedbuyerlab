import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Vite's content sync evaluates Astro's dependency graph as ESM. picomatch is
// CommonJS, so loading it through Node's native resolver avoids Vite attempting
// to execute `require` inside its module runner.
export default require("picomatch");
