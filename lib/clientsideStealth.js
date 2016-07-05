/* global document window */
(function() {
  "use strict";
  var stealth = window.stealth = { };

  stealth.$ = function(selector) {
    return document.querySelectorAll(selector)[0];
  };
  stealth.loadingDiv = stealth.$("#stealth-loader");
  stealth.mainPage = stealth.$("#stealth-page");

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

  stealth.handleClick = function(e) {
    console.log(e);
  };




  window.addEventListener("load", stealth.showPage, false);
  window.addEventListener("click", stealth.handleClick, false);
})();
