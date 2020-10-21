"use strict";

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
      } = await runCommandAndWaitForPattern(
        `amphtml-validator ${url}`,
        null,
        null
      );

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