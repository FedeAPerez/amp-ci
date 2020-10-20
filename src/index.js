#!/usr/bin/env node
"use strict";
const collectCmd = require("./collect");

async function run() {
  process.stdout.write(`Executing AMP CI\n`);

  try {
    process.stdout.write(require.resolve("amphtml-validator"));
  } catch (e) {
    process.stderr.write("amphtml-validator is not found");
    process.exit(e.code);
  }

  collectCmd.runCommand({
    urls: ["http://localhost:3001/amp/comenzar-programacion-competitiva"],
    startServerCommand: "npm run start",
  });

  process.exit(0);
}

run().catch((err) => {
  process.stderr.write(err.stack);
  if (err.stdout) process.stderr.write("\n" + err.stdout.slice(0, 4000));
  if (err.stderr) process.stderr.write("\n" + err.stderr);
  process.exit(1);
});
