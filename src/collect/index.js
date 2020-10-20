"use strict";

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const NodeRunner = require("./node-runner.js");

function getRunner(options) {
  return new NodeRunner();
}

async function runOnUrl(url, options) {
  const runner = getRunner(options);
  process.stdout.write(`Running AMP CI on ${url}\n`);

  try {
    await runner.runUntilSuccess(url, {
      ...options,
      settings,
    });

    process.stdout.write("done.\n");
  } catch (err) {
    process.stdout.write("failed!\n");
    throw err;
  }
}

async function startServerAndDetermineUrls(options) {
  const urlsAsArray = Array.isArray(options.url)
    ? options.url
    : options.url
    ? [options.url]
    : [];

  const { stdout, stderr } = await exec(options.startServerCommand);

  process.stdout.write(`Started server \n`);

  return { urls: urlsAsArray, close: async () => server.close() };
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
