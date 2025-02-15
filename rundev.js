// Using CommonJS:
const { TscWatchClient } = require("tsc-watch/client");
// Using ES6 import:
// import { TscWatchClient } from "tsc-watch/client";

const watch = new TscWatchClient();

watch.start("--onSuccess", "node -r tsconfig-paths/register ./dist/main.js");

try {
  // do something...
} catch (e) {
  watch.kill(); // Fatal error, kill the compiler instance.
}
