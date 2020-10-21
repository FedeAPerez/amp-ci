"use strict";
const {
  runCommandAndWaitForPattern,
  killProcessTree,
} = require("../utils/base-process");

class AmpRunner {
  async run(url, options) {
    let pid;
    let close = async () => undefined;

    close = (pid) => killProcessTree(pid);

    try {
      const {
        child,
        patternMatch,
        stdout,
        stderr,
        errors,
      } = await runCommandAndWaitForPattern(`amphtml-validator ${url}`, null, {
        timeout: 5000,
      });

      if (errors) {
        process.stdout.write(`Errors in ${url} \n ${errors}`);
      }

      pid = child.pid;
    } finally {
      await close();
    }
  }

  async runUntilSuccess(url, options = {}) {
    const attempts = [];

    while (attempts.length < 3) {
      try {
        return await this.run(url, options);
      } catch (err) {
        attempts.push(err);
      }
    }

    throw attempts[0];
  }
}

module.exports = AmpRunner;
