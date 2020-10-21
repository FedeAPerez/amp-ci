#!/usr/bin/env node
"use strict";
const path = require("path");
const collectCmd = require("./collect");
const pkg = require("../package.json");

const PASS_ICON = "✅";
const WARN_ICON = "⚠️ ";
const FAIL_ICON = "❌";

const resolveRcFilePath = (pathToRcFile) => {
  if (typeof pathToRcFile === "string")
    return path.resolve(process.cwd(), pathToRcFile);
};

const loadRcFile = (pathToRcFile) => {
  return require(resolveRcFilePath(pathToRcFile));
};

async function run() {
  let options;
  process.stdout.write(`Executing AMP CI ${pkg.version} \n`);

  try {
    require.resolve("amphtml-validator");
  } catch (e) {
    process.stderr.write("\n❌ amphtml-validator dependency not found");
    process.exit(1);
  }

  try {
    options = loadRcFile("./ampcirc.js");
    process.stdout.write("\n✅ ampcirc file found");
  } catch (e) {
    process.stderr.write("\n❌ ampcirc file not found");
    process.exit(1);
  }

  await collectCmd.runCommand(options.ci.collect);

  process.exit(0);
}

run().catch((err) => {
  process.stderr.write(err.stack);
  if (err.stdout) process.stderr.write("\n" + err.stdout.slice(0, 4000));
  if (err.stderr) process.stderr.write("\n" + err.stderr);
  process.exit(1);
});
