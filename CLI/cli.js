#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const fs = require("fs");
const { V } = require("../index");

program
  .version('0.0.1', '-v, --version')
  .arguments('<file>')
  .option('-p, --port [value]','Port Number')
  .action(function(file) {
    console.log('port: %s file: %s',
    program.port, path.resolve(file));
  })
  .parse(process.argv);