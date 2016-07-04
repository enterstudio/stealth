
module.exports = {
  redirect: "/something",
  action: function(request, callback) {
    request.session.i++;
    return callback(null, { foo: "bar" });
  }
};
