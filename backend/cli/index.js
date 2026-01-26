const { Command } = require('commander');

const registerDb = require('./commands/db');
const registerCache = require('./commands/cache');
const registerServer = require('./commands/server');
const registerHealth = require('./commands/health');

function buildProgram() {
  const program = new Command();

  program
    .name('rcs')
    .description('Research Collaboration System (RCS) CLI')
    .version('1.0.0');

  registerDb(program);
  registerCache(program);
  registerServer(program);
  registerHealth(program);

  program.showHelpAfterError(true);
  program.configureHelp({ sortSubcommands: true, sortOptions: true });

  return program;
}

module.exports = { buildProgram };
