/* global document window XMLHttpRequest history */
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
  stealth.errorDiv = stealth.$$("#stealth-error");

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
    stealth.showElement(stealth.loadingDiv);
    stealth.hideElement(stealth.mainPage);
  };

  stealth.showError = function(err) {
    stealth.hideElement(stealth.loadingDiv);
    stealth.hideElement(stealth.mainPage);
    stealth.showElement(stealth.errorDiv);
    var errMessage = stealth.$$("#stealth-error-message");
    if (errMessage) errMessage.innerHTML = err;
  };

  stealth.serialiseForm = function(htmlForm) {
    var formInputs = stealth.$("input,select", htmlForm);
    var queryString = formInputs.map(function(formInput) {
      if (!formInput.value) return null;
      return formInput.name + "=" + formInput.value;
    });
    queryString.push("snippet=1")
    queryString = queryString.filter(function(pairing) {
      return pairing;
    }).join("&");
    return queryString;
  };

  stealth.handleClick = function(e) {
    var anchorTag = e.target;
    if (anchorTag.tagName.toLowerCase() !== "a") return;
    e.preventDefault();

    var href = anchorTag.href;
    if (href.indexOf("?") === -1) {
      href += "?snippet=1";
    } else {
      href += "&nsnippet=1";
    }

    var request = {
      verb: "GET",
      url: href,
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
    var pageOffset = window.scrollY;
    stealth.hidePage()
    stealth.doAjax(request, function(err, markup) {
      history.pushState({ offset: pageOffset }, document.title, request.url.replace(/snippet\=1$/, ""));
      if (err) {
        return stealth.showError(err)
      }

      stealth.mainPage.innerHTML = markup;
      stealth.showPage();
    });
  };

  stealth.doAjax = function(request, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(request.verb, request.url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(request.body || null);
    xhr.timeout = 30 * 1000;
    xhr.onload = function(e) {
      var markup = e.target.response;
      if (e.target.status !== 200) {
        return callback(markup);
      }
      return callback(null, markup);
    };
    xhr.onerror = function(e) {
      return callback(e.target.response);
    };
    xhr.ontimeout = function() {
      return callback("Request Timeout");
    };
  };

  stealth.locationChange = function(e) {
    console.log(e.state);
    if (!e.state) return;
    setTimeout(function() {
      window.scrollTo(0, e.state.offset);
    }, 1);
  };

  window.addEventListener("load", stealth.showPage, false);
  window.addEventListener("error", stealth.showError, false);
  window.addEventListener("click", stealth.handleClick, false);
  window.addEventListener("submit", stealth.handleSubmit, false);
  window.onpopstate = stealth.locationChange;
})();
