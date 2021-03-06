var router = module.exports = { };

var express = require("express");
var app = express();
var fs = require("fs");
var _ = require("underscore");
var bodyParser = require("body-parser")
var session = require("express-session");
var languageParser = require('accept-language-parser');
var useragent = require("useragent");
var helmet = require("helmet");
var RedisStore = require("connect-redis")(session);
var debug = require("./debugging.js");
var templating = require("./templating.js");
var cookie = require("cookie");

app.use(session({
  name: "unsession",
  store: new RedisStore({ host: "localhost" }),
  secret: "keyboard cat",
  resave: true,
  saveUninitialized: true
  // cookie: { secure: true } // requires HTTPS
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static(process.cwd() + "/static"));

router._getParams = function(req) {
  return {
    domain: req.headers.host.replace(/\:.+$/, ""),
    path: req.url,
    type: req.method === "GET" ? "page" : "action",
    referer: req.headers["referer"] || null,
    config: router._config[req.headers.host.replace(/\:.+$/, "")],
    languages: languageParser.parse(req.headers["accept-language"] || ""),
    params: _.assign(req.params, req.body, req.query),
    session: req.session,
    cookies: cookie.parse(req.headers["cookie"] || ""),
    browser: useragent.parse(req.headers["user-agent"] || "")
  };
};

router.listen = function() {
  // server = require("https").createServer(jsonApi._apiConfig.tls || {}, app);
  var server = require("http").createServer(app);
  server.listen(16006);
};

router.register = function(path, verb, middleware, callback) {
  var handler = function(req, res, extras) {
    var request = router._getParams(req);
    request = _.assign(request, extras);
    debug.request(JSON.stringify(request));

    return callback(request, res);
  };
  var args = [path].concat(middleware).concat(handler)
  app[verb].apply(app, args);
};

router._loadConfig = function(path) {
  var config = { };
  fs.readdirSync(path).map(function(file) {
    var domain = file.replace(/\.js$/i, "");
    config[domain] = require(path + "/" + file);
  });
  for (var i in config) {
    config[i] = _.extend({ }, config["default"], config[i]);
  }
  router._config = config;
};

router.startResponse = function(request, res) {
  if (request.params.snippet) return;

  var htmlHeader = templating.render(request, "header.hbs");
  var loadingBar = templating.getPageLoader(request);
  var errorPage = templating.getErrorPage(request);
  var clientsideStealth = templating.getClientSideStealth();
  var pageContainer = "<div id='stealth-page' style='display: none;'>";
  res.set("Content-Type", "text/html");
  res.write(htmlHeader + loadingBar + errorPage + clientsideStealth + pageContainer);
};

router._finishResponse = function(request, res) {
  if (request.params.snippet) return res.end();
  var htmlFooter = templating.render(request, "footer.hbs");
  var pageEnd = "</div><script type='text/javascript'>stealth.mainPage = stealth.$$('#stealth-page');</script>";
  res.end(pageEnd + htmlFooter);
};

router.render = function(request, res, template, templateData) {
  var htmlBody = templating.render(request, template, templateData);
  res.write(htmlBody);
  router._finishResponse(request, res);
};

router.handleError = function(res, err, partial) {
  var safeError = (err.message || err).toString().replace(/'/g, "\\'");
  res.status(500);
  if (partial) {
    res.write(safeError + "</div>");
  }
  var stealthError = "<script type='text/javascript'>stealth.mainPage = stealth.$$('#stealth-page'); stealth.showError('" + safeError + "');</script>";
  res.end(stealthError);
};

router.redirect = function(res, destination) {
  return res.redirect(destination);
};

router._load = function() {
  router._loadConfig(process.cwd() + "/config");

  app.use(function(req, res, extras) {
    res.set("Content-Type", "text/html");
    var request = router._getParams(req);
    request = _.assign(request, extras);
    debug.page404(JSON.stringify(request));
    var page404 = templating.render(request, "404.hbs");
    return res.end(page404);
  });
};
