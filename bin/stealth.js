#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var shell = require('shelljs');

var package = null;
var cwd = process.cwd();
try {
  package = require(cwd + '/package.json');
} catch(e) {
  throw new Error('You need to create a package.json');
}

var nodeVersion = package.engines.node;

if (argv._.indexOf('init') !== -1) {
  shell.mkdir('-p', [ 'actions', 'config', 'pages', 'static', 'templates']);
  shell.cp(__dirname + '/../build/*', '.');
}

if (argv._.indexOf('start') !== -1) {
  require('stealth').start();
}

if (argv._.indexOf('build') !== -1) {
  shell.exec(`
    packer build \
      -var 'package=${package.name}' \
      -var 'path=${cwd}' \
      -var 'nodeVersion=${nodeVersion}' \
      ./packer.json`);
}
