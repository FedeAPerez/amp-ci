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
  process.stdout.write(`Running AMP CI on ${url}\n`);

  try {
    await runner.runUntilSuccess(url, options);

    process.stdout.write("done.\n");
  } catch (err) {
    process.stdout.write("failed!\n");
    throw err;
  }
}

async function startServerAndDetermineUrls(options) {
  let close = async () => undefined;
  const urlsAsArray = options.url;

  process.stdout.write(
    `Trying to start server with ${options.startServerCommand} \n`
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
    `Started a web server with "${options.startServerCommand}"...\n`
  );

  close = () => killProcessTree(child.pid);

  return {
    urls: urlsAsArray,
    close: async () => {
      /* something to kill the process based on pid */
    },
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

  process.stdout.write(`Done running AMP CI!\n`);
}

module.exports = { runCommand };
