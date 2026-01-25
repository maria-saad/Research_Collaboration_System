const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const { run } = require("../lib/run");

function resolveComposeFile(userProvided) {
  if (userProvided) {
    return path.resolve(process.cwd(), userProvided);
  }

  // 1) try project root: ../docker-compose.yml
  const rootCompose = path.resolve(process.cwd(), "..", "docker-compose.yml");
  if (fs.existsSync(rootCompose)) return rootCompose;

  // 2) fallback: ./docker-compose.yml (inside backend)
  const localCompose = path.resolve(process.cwd(), "docker-compose.yml");
  if (fs.existsSync(localCompose)) return localCompose;

  // 3) if none exist, return root path guess (for clearer error)
  return rootCompose;
}

module.exports = function registerDb(program) {
  const db = program.command("db").description("Database operations");

  db.command("up")
    .description("Start docker compose services")
    .option("-f, --file <file>", "docker compose file path (default: auto-detect)")
    .action(async (opts) => {
      const composeFile = resolveComposeFile(opts.file);

      try {
        console.log(chalk.cyan(`Starting services using ${composeFile}...`));
        await run("docker", ["compose", "-f", composeFile, "up", "-d"]);
      } catch (e) {
        console.error(chalk.red("docker compose up failed:"), e.message);
        process.exit(1);
      }
    });

  db.command("down")
    .description("Stop docker compose services")
    .option("-f, --file <file>", "docker compose file path (default: auto-detect)")
    .action(async (opts) => {
      const composeFile = resolveComposeFile(opts.file);

      try {
        console.log(chalk.cyan(`Stopping services using ${composeFile}...`));
        await run("docker", ["compose", "-f", composeFile, "down"]);
      } catch (e) {
        console.error(chalk.red("docker compose down failed:"), e.message);
        process.exit(1);
      }
    });

  db.command("logs")
    .description("Tail logs for a docker compose service")
    .argument("<service>", "service name (e.g. neo4j, mongo, redis, cassandra1)")
    .option("-f, --file <file>", "docker compose file path (default: auto-detect)")
    .option("--tail <n>", "number of lines", "100")
    .action(async (service, opts) => {
      const composeFile = resolveComposeFile(opts.file);

      try {
        console.log(chalk.cyan(`Tailing logs for ${service} using ${composeFile}...`));
        await run("docker", ["compose", "-f", composeFile, "logs", service, "--tail", opts.tail, "-f"]);
      } catch (e) {
        console.error(chalk.red("logs failed:"), e.message);
        process.exit(1);
      }
    });

  // seed and seed-analytics keep as-is
  db.command("seed")
    .description("Run seed.js (your existing seeding script)")
    .action(async () => {
      try {
        const script = path.resolve(process.cwd(), "seed.js");
        console.log(chalk.cyan("Running seed.js ..."));
        await run("node", [script]);
      } catch (e) {
        console.error(chalk.red("seed failed:"), e.message);
        process.exit(1);
      }
    });

  db.command("seed-analytics")
    .description("Run seedAnalyticsEvents.js (your existing Cassandra analytics seeder)")
    .action(async () => {
      try {
        const script = path.resolve(process.cwd(), "seedAnalyticsEvents.js");
        console.log(chalk.cyan("Running seedAnalyticsEvents.js ..."));
        await run("node", [script]);
      } catch (e) {
        console.error(chalk.red("seed-analytics failed:"), e.message);
        process.exit(1);
      }
    });
};
