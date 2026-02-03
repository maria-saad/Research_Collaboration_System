let chalk;

try {
  chalk = require('chalk');
  chalk = chalk.default ?? chalk;
} catch (e) {
  chalk = null;
}

const passthrough = (s) => s;

function pick(fnName) {
  const fn = chalk?.[fnName];
  return typeof fn === 'function' ? fn : passthrough;
}

module.exports = {
  red: pick('red'),
  green: pick('green'),
  yellow: pick('yellow'),
  blue: pick('blue'),
  cyan: pick('cyan'),
  magenta: pick('magenta'),
  gray: pick('gray'),
  bold: (s) => (chalk?.bold ? chalk.bold(s) : s),
};
