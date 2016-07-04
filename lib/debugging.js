/* @flow weak */
"use strict";

var debug = require("debug");


module.exports = {
  startup: debug("stealth:startup"),
  request: debug("stealth:request"),
  templateLoad: debug("stealth:template:load"),
  templateRender: debug("stealth:template:render")
};
