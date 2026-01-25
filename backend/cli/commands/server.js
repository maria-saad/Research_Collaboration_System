const chalk = require("chalk");
const { run } = require("../lib/run");

module.exports = function registerServer(program) {
  const server = program.command("server").description("Server operations");

  server
    .command("start")
    .description("Start backend server")
    .option("--dev", "run in dev mode (nodemon)", false)
    .action(async (opts) => {
      try {
        if (opts.dev) {
          console.log(chalk.cyan("Starting backend (dev: nodemon src/server.js)..."));
          await run("npm", ["run", "dev"]);
        } else {
          console.log(chalk.cyan("Starting backend (start: node src/server.js)..."));
          await run("npm", ["start"]);
        }
      } catch (e) {
        console.error(chalk.red("Failed to start server:"), e.message);
        process.exit(1);
      }
    });
};
