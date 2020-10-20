"use strict";

class AmpRunner {
  async run(url, options) {
    process.stdout.write(`Running AMP CI TEST ${url} \n`);
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
