const { execa } = require("execa");

async function run(cmd, args, opts = {}) {
  return execa(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
}

module.exports = { run };
