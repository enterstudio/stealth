var templating = module.exports = { };

var fs = require('fs');
var debug = require("./debugging.js");
var handlebars = require('handlebars');
templating._domains = fs.readdirSync(process.cwd() + "/templates");


handlebars.VM.invokePartial = function invokePartial(partial, context, options) {
  var partialName = options.name;
  var template = templating._getTemplate(partialName, "folder", "domain");
  debug.templateRender(">" + template._path, context);
  return template(context, options);
};

templating._loadTemplatesFromFolder = function(basePath, path) {
  fs.readdirSync(basePath + path).forEach(function(file) {
    var filePath = path + "/" + file;
    if (file.match(/\.hbs$/i)) { // template
      var template = fs.readFileSync(basePath + filePath).toString();
      templating._rawTemplates[filePath] = template;
      debug.templateLoad("Compiling template", filePath);
      var compiledTemplate = handlebars.compile(template);
      compiledTemplate._path = filePath;
      templating._templates[filePath] = compiledTemplate;
    } else { // folder
      var someFolder = { };
      templating._loadTemplatesFromFolder(basePath, filePath, someFolder);
      templating._templates[filePath] = someFolder;
    }
  });
};

templating._getTemplate = function(file, folder, domain) {
  if (!file.match(/\.hbs$/)) file = file + ".hbs";

  var paths = [
    folder + "/" + file,
    "/" + domain + "/" + file,
    "/default/" + file
  ];

  var template = null;
  paths.some(function(path) {
    template = templating._templates[path];
    return template;
  });
  if (template) return template;

  console.log("Failed to find template!!");
  console.log(">", paths);
  console.log("in");
  console.log(">", Object.keys(templating._templates));
  return null;
};

templating._validateTemplateExists = function(fullTemplatePath, partial) {
  var file = partial.match(/\{\{\> (_[a-zA-Z]+)[^}]*?\}\}/)[1];
  var folder = fullTemplatePath.split("/").slice(0, -1).join("/");
  var domain = fullTemplatePath.split("/")[1];

  var template = templating._getTemplate(file, folder, domain);
  if (template) return;

  throw new Error("Requested partial doesn't exist! " + file + " in " + fullTemplatePath);
};

templating._validateTemplates = function() {
  for (var fullTemplatePath in templating._rawTemplates) {
    var someTemplate = templating._rawTemplates[fullTemplatePath];
    var partials = someTemplate.match(/\{\{\> (_[a-zA-Z]+)[^}]*?\}\}/g);
    if (!partials) continue;

    partials.forEach(function(partial) {
      templating._validateTemplateExists(fullTemplatePath, partial);
    });
  }
};

templating._loadTemplates = function() {
  templating._rawTemplates = { };
  templating._templates = { };
  debug.templateLoad("Looking for files in", process.cwd() + "/templates");
  templating._loadTemplatesFromFolder(process.cwd() + "/templates", "");
  debug.templateLoad("Loaded all templates");
  templating._validateTemplates();
};
templating._loadTemplates();

templating._buildFullTemplatePath = function(request, template) {
  var requestedDomain = request.domain;
  requestedDomain = requestedDomain.replace(/^www./i, "");
  template = template.replace(/^\//, "");

  if (templating._domains.indexOf(requestedDomain) === -1) {
    requestedDomain = "default";
  }

  if (!template.match(/\.hbs$/)) {
    template = template + ".hbs";
  }

  return "/" + requestedDomain + "/" + template;
};

templating.render = function(request, template, templateData) {
  var templatePath = templating._buildFullTemplatePath(request, template);
  var compiledTemplate = templating._templates[templatePath];
  debug.templateRender(templatePath, templateData || null);
  var markup = compiledTemplate(templateData);
  return markup;
};

templating.wrapInDiv = function(id, markup, hidden) {
  if (hidden) hidden = "style='display: none;'"
  return "<div id='" + id + "' " + hidden + ">" + markup + "</div>";
};

templating.loadScript = function(path) {
  var script = fs.readFileSync(path).toString();
  return "<script type='text/javascript'>" + script + "</script>";
};

templating.getClientSideStealth = function() {
  var clientsideStealth = templating.loadScript(__dirname + "/clientsideStealth.js");
  return clientsideStealth;
};

templating.getPageLoader = function(request) {
  var loadingHtml = templating.render(request, "loading.hbs");
  var loadingDiv = templating.wrapInDiv("stealth-loader", loadingHtml);
  return loadingDiv;
};

templating.getErrorPage = function(request) {
  var errorHtml = templating.render(request, "error.hbs");
  var errorDiv = templating.wrapInDiv("stealth-error", errorHtml, true);
  return errorDiv;
};
