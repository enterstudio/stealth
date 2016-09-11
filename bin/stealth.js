#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var shell = require('shelljs');

if (argv._.indexOf('start') !== -1) {
  require('stealth').start();
}

if (argv._.indexOf('init') !== -1) {
  shell.mkdir([ 'actions', 'config', 'pages', 'static', 'templates']);
  console.log("I'm here", __dirname)
}
