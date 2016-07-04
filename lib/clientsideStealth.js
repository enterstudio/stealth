/* global $ document window */
(function() {
  "use strict";
  var stealth = window.stealth = { };

  stealth.loadingDiv = $("#stealth-loader");
  stealth.mainPage = $("#stealth-page");

  stealth.showPage = function() {
    stealth.loadingDiv.hide();
    stealth.mainPage.show();
  };

  stealth.hidePage = function() {
    stealth.loadingDiv.show();
    stealth.mainPage.hide();
  };

  stealth.handleClick = function(e) {
    console.log(e);
  };

  


  $(document).ready(stealth.showPage);
  $(document).on("click", stealth.handleClick);
})();
