#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var shell = require('shelljs/global');

if (argv._.indexOf('start') !== -1) {
  require('stealth').start();
}

if (argv._.indexOf('init') !== -1) {
  shell.mkdir('actions');
  shell.mkdir('config');
  shell.mkdir('pages');
  shell.mkdir('static');
  shell.mkdir('templates');
  console.log("I'm here", __dirname)
}
