"use strict";
var selenium = require('selenium-download');

selenium.ensure('./bin', function(error) {
   if (error) throw error;
   process.exit(0);
});
