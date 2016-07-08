/* @flow weak */
"use strict";

var debug = require("debug");


module.exports = {
  startup: debug("stealth:startup"),
  request: debug("stealth:request"),
  page404: debug("stealth:404"),
  templateLoad: debug("stealth:template:load"),
  templateRender: debug("stealth:template:render")
};
