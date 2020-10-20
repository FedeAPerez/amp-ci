#!/usr/bin/env node
"use strict";
const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function run() {
  process.stdout.write(`Executing AMP CI\n`);
  const { stdout, stderr } = await exec(
    'amphtml-validator "http://localhost:3001/amp/comenzar-programacion-competitiva"'
  );
  process.exit(0);
}

run().catch((err) => {
  process.stderr.write(err.stack);
  if (err.stdout) process.stderr.write("\n" + err.stdout.slice(0, 4000));
  if (err.stderr) process.stderr.write("\n" + err.stderr);
  process.exit(1);
});
