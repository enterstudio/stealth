/* global document window XMLHttpRequest */
(function() {
  "use strict";
  var stealth = window.stealth = { };

  stealth.$ = function(selector, container) {
    container = container || document;
    var matchingElements = container.querySelectorAll(selector);
    return Array.prototype.slice.call(matchingElements);
  };
  stealth.$$ = function(selector, container) {
    return stealth.$(selector, container)[0];
  };
  stealth.loadingDiv = stealth.$$("#stealth-loader");
  stealth.mainPage = stealth.$$("#stealth-page");

  stealth.hideElement = function(elem) {
    elem.style.display = "none";
  };
  stealth.showElement = function(elem) {
    elem.style.display = "block";
  };

  stealth.showPage = function() {
    stealth.hideElement(stealth.loadingDiv);
    stealth.showElement(stealth.mainPage);
  };

  stealth.hidePage = function() {
    stealth.showElement(stealth.loadingDiv.show);
    stealth.hideElement(stealth.mainPage);
  };

  stealth.serialiseForm = function(htmlForm) {
    var formInputs = stealth.$("input,select", htmlForm);
    var queryString = formInputs.map(function(formInput) {
      if (!formInput.value) return null;
      return formInput.name + "=" + formInput.value;
    }).filter(function(pairing) {
      return pairing;
    }).join("&");
    return queryString;
  };

  stealth.handleClick = function(e) {
    var anchorTag = e.target;
    if (anchorTag.tagName.toLowerCase() !== "a") return;
    e.preventDefault();

    var request = {
      verb: "GET",
      url: anchorTag.href,
      body: null
    };
    stealth.processRequest(request);
  };

  stealth.handleSubmit = function(e) {
    var htmlForm = e.target;
    if (htmlForm.tagName.toLowerCase() !== "form") return;
    e.preventDefault();

    var request = {
      verb: "POST",
      url: htmlForm.action,
      body: stealth.serialiseForm(htmlForm)
    };
    stealth.processRequest(request);
  };

  stealth.processRequest = function(request) {
    stealth.hidePage()
    stealth.doAjax(request, function(err, markup) {

      document.body.innerHTML = markup;
      stealth.showPage()
    });
  };

  stealth.doAjax = function(request, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(request.verb, request.url, true);
    xhr.send(request.body || null);
    xhr.timeout = 30 * 1000;
    xhr.onload = function(e) {
      var markup = e.target.response;
      console.log(e.target.status);
      return callback(null, markup);
    };
    xhr.onerror = function() { console.log("error", arguments); };
    xhr.ontimeout = function() { console.log("timeout", arguments); };
  };
  window.addEventListener("load", stealth.showPage, false);
  window.addEventListener("click", stealth.handleClick, false);
  window.addEventListener("submit", stealth.handleSubmit, false);
})();
