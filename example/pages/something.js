
module.exports = {
  template: "/something",
  preRender: function(request, callback) {
    setTimeout(function() {
      return callback(null, { i: request.session.i || 0 });
    }, 2000);
  }
};