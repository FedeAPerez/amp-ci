"use strict";
const {
  runCommandAndWaitForPattern,
  killProcessTree,
} = require("../utils/index");
const NodeRunner = require("./node-runner.js");

function getRunner(options) {
  return new NodeRunner();
}

async function runOnUrl(url, options) {
  const runner = getRunner(options);
  process.stdout.write(`\nRunning AMP CI on ${url}`);

  try {
    await runner.runUntilSuccess(url, options);

    process.stdout.write("✅ done.\n");
  } catch (err) {
    process.stdout.write("failed!\n");
    throw err;
  }
}

async function startServerAndDetermineUrls(options) {
  let close = async () => undefined;
  const urlsAsArray = options.url;

  process.stdout.write(
    `\n✅ Trying to start server with ${options.startServerCommand}`
  );

  const {
    child,
    patternMatch,
    stdout,
    stderr,
  } = await runCommandAndWaitForPattern(options.startServerCommand, null, {
    timeout: options.startServerReadyTimeout,
  });

  process.stdout.write(
    `\n✅ Started a web server with "${options.startServerCommand}"...`
  );

  close = () => killProcessTree(child.pid);

  return {
    urls: urlsAsArray,
    close: close,
  };
}

async function runCommand(options) {
  const { urls, close } = await startServerAndDetermineUrls(options);

  try {
    for (const url of urls) {
      await runOnUrl(url, options);
    }
  } finally {
    await close();
  }

  process.stdout.write(`✅ Done running AMP CI!\n`);
}

module.exports = { runCommand };
