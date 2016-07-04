var stealth = module.exports = { };

var fs = require("fs");
var router = require("./router.js");
var debug = require("./debugging.js");

stealth._loadModulesInFolder = function(path) {
  return fs.readdirSync(path).map(function(file) {
    var someModule = require(path + "/" + file);
    someModule.path = '/' + file.replace(/\.js$/i, "");
    return someModule;
  });
};

stealth._prepareActionTransition = function() { };

stealth._handleAction = function(action) {
  debug.startup("Registered POST " + action.path);
  router.register(action.path, 'post', function(request, res) {
    action.action(request, function(err, result) {
      stealth._prepareActionTransition(request, result);
      return router.redirect(res, action.redirect);
    });
  });
};

stealth._handlePage = function(page) {
  debug.startup("Registered GET " + page.path);
  router.register(page.path, 'get', function(request, res) {
    router.startResponse(request, res);
    page.preRender(request, function(err, templateData) {
      return router.render(request, res, page.template, templateData);
    });
  });
};

stealth._loadActions = function() {
  var pathToActions = process.cwd() + "/actions";
  var routes = stealth._loadModulesInFolder(pathToActions);

  routes.forEach(stealth._handleAction);
};

stealth._loadPages = function() {
  var pathToPages = process.cwd() + "/pages";
  var routes = stealth._loadModulesInFolder(pathToPages);

  routes.forEach(stealth._handlePage);
};

stealth.start = function() {
  debug.startup("Running from", process.cwd());
  stealth._loadPages();
  stealth._loadActions();
  router.listen();
};
