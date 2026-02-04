#!/usr/bin/env node
const { spawnSync } = require("child_process");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function tryRun(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "ignore", shell: true });
  return r.status === 0;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForComposeServiceExec(service, maxTries = 45) {
  for (let i = 1; i <= maxTries; i++) {
    // -T: بدون TTY (أثبت للـ scripts)
    if (tryRun("docker", ["compose", "exec", "-T", service, "node", "-e", "process.exit(0)"])) return;
    console.log(`⏳ waiting for ${service}... (${i}/${maxTries})`);
    await sleep(2000);
  }
  console.error(`❌ ${service} not ready in time`);
  process.exit(1);
}

(async () => {
  console.log("🚀 docker compose up -d");
  run("docker", ["compose", "up", "-d"]);

  console.log("⏳ waiting backend...");
  await waitForComposeServiceExec("backend");

  console.log("🌱 seed databases (Mongo + Neo4j)...");
  run("docker", ["compose", "exec", "backend", "npm", "run", "rcs", "--", "db", "seed"]);

  console.log("🧹 clear redis cache...");
  run("docker", ["compose", "exec", "backend", "npm", "run", "rcs", "--", "cache", "clear"]);

  console.log("🩺 health check...");
  run("docker", ["compose", "exec", "backend", "npm", "run", "rcs", "--", "health"]);

  console.log("✅ Done!");
  console.log("Backend:  http://localhost:5000");
  console.log("Frontend: http://localhost:3000");
})();
const { spawn } = require("child_process");

function openUrl(url) {
  const platform = process.platform;
  if (platform === "win32") spawn("cmd", ["/c", "start", "", url], { stdio: "ignore" });
  else if (platform === "darwin") spawn("open", [url], { stdio: "ignore" });
  else spawn("xdg-open", [url], { stdio: "ignore" });
}

openUrl("http://localhost:3000");
openUrl("http://localhost:5000");

