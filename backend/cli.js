#!/usr/bin/env node
const { Command } = require("commander");
const { execSync } = require("child_process");

const program = new Command();

program
  .name("rcs")
  .description("Research Collaboration System CLI")
  .version("1.0.0");

program
  .command("start")
  .description("Run backend in dev mode")
  .action(() => {
    execSync("npm run dev", { stdio: "inherit" });
  });

program
  .command("seed")
  .description("Run database seed script")
  .action(() => {
    execSync("node seed.js", { stdio: "inherit" });
  });

program.parse(process.argv);
