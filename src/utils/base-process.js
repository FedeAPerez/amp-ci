"use strict";

const treeKill = require("tree-kill");
const childProcess = require("child_process");

async function killProcessTree(pid) {
  return new Promise((resolve) => treeKill(pid, resolve));
}

async function runCommandAndWaitForPattern(command, pattern, opts = {}) {
  const { timeout = 5000 } = opts;

  let patternMatch = null;
  let resolve;
  let reject;
  let errors;
  const timeoutPromise = new Promise((r) => setTimeout(r, timeout));
  const foundStringPromise = new Promise((r1, r2) => {
    resolve = r1;
    reject = r2;
  });
  const output = { stdout: "", stderr: "" };

  const child = childProcess.spawn(command, { stdio: "pipe", shell: true });

  const stringListener = (channel) => (chunk) => {
    const data = chunk.toString();
    output[channel] += data;
    const match = chunk.toString().match(pattern);
    patternMatch = patternMatch || (match && match[0]);
    if (match) resolve();
  };

  const exitListener = (code) => {
    if (code !== 0) {
      const err = new Error(`Command exited with code ${code}`);
      Object.assign(err, output);
      errors = output;
      resolve();
    }
  };

  const stdoutListener = stringListener("stdout");
  const stderrListener = stringListener("stderr");

  child.on("exit", exitListener);
  child.stdout.on("data", stdoutListener);
  child.stderr.on("data", stderrListener);
  await Promise.race([timeoutPromise, foundStringPromise]);
  child.stdout.off("data", stdoutListener);
  child.stderr.off("data", stderrListener);
  child.off("exit", exitListener);

  return { child, patternMatch, errors, ...output };
}

module.exports = {
  killProcessTree,
  runCommandAndWaitForPattern,
};
