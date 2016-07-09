
module.exports = {
  redirect: "/something",
  action: function(request, callback) {
    request.session.i++;
    // throw new Error();
    return callback(null, { foo: "bar" });
  }
};
