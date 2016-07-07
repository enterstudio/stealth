var router = module.exports = { };

var express = require("express");
var app = express();
var _ = require("underscore");
var bodyParser = require("body-parser")
var session = require("express-session");
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
    params: _.assign(req.params, req.body, req.query),
    session: req.session,
    cookies: cookie.parse(req.headers["cookie"]),
    browser: useragent.parse(req.headers["user-agent"]),
    route: {
      verb: req.method,
      host: req.headers.host,
      path: req.path,
      url: req.url
    }
  };
};

router.listen = function() {
  // server = require("https").createServer(jsonApi._apiConfig.tls || {}, app);
  var server = require("http").createServer(app);
  server.listen(16006);
};

router.register = function(path, verb, callback) {
  app[verb](path, function(req, res, extras) {
    var request = router._getParams(req);
    request = _.assign(request, extras);
    debug.request(JSON.stringify(request));

    return callback(request, res);
  });
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

router.redirect = function(res, destination) {
  return res.redirect(destination);
};
