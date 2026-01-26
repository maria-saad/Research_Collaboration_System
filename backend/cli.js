#!/usr/bin/env node
require('dotenv').config();

const { buildProgram } = require('./cli/index');

buildProgram().parse(process.argv);
