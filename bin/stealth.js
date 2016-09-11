#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var shell = require('shelljs');

if (argv._.indexOf('init') !== -1) {
  shell.mkdir('-p', [ 'actions', 'config', 'pages', 'static', 'templates']);
  shell.cp(__dirname + '/../build/*', '.');
}

if (argv._.indexOf('start') !== -1) {
  require('stealth').start();
}

if (argv._.indexOf('build') !== -1) {
  shell.exec('packer build ./packer.json ');
}
