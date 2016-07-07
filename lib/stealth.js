var stealth = module.exports = { };

var fs = require("fs");
var uuid = require("node-uuid");
var router = require("./router.js");
var debug = require("./debugging.js");
var _ = require("lodash");

stealth._loadConfig = function(path) {
  var config = { };
  fs.readdirSync(path).map(function(file) {
    var domain = file.replace(/\.js$/i, "");
    config[domain] = require(path + "/" + file);
  });
  for (var i in config) {
    config[i] = _.extend({ }, config["default"], config[i]);
  }
  return config;
};

stealth._loadModulesInFolder = function(path) {
  return fs.readdirSync(path).map(function(file) {
    var someModule = require(path + "/" + file);
    someModule.path = '/' + file.replace(/\.js$/i, "");
    return someModule;
  });
};

stealth._prepareActionTransition = function(request, actionData) {
  var pageToken = uuid.v4();
  request.session.nextPage = {
    pageToken: pageToken,
    requestParams: request.params,
    actionData: actionData
  };
  return pageToken;
};

stealth._finishActionTransition = function(request) {
  if (!request.session.nextPage) return;
  if (request.session.nextPage.pageToken !== request.params.pageToken) return;
  _.extend(request.params, request.session.nextPage.requestParams);
  _.extend(request.params, request.session.nextPage.actionData);
  request.session.nextPage = null;
};

stealth._handleAction = function(action) {
  debug.startup("Registered POST " + action.path);
  router.register(action.path, 'post', function(request, res) {
    action.action(request, function(err, actionData) {
      var pageToken = stealth._prepareActionTransition(request, actionData);
      return router.redirect(res, action.redirect + "?pageToken=" + pageToken);
    });
  });
};

stealth._handlePage = function(page) {
  debug.startup("Registered GET " + page.path);
  router.register(page.path, 'get', function(request, res) {
    stealth._finishActionTransition(request);
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
