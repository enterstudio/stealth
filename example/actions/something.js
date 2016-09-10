
module.exports = {
  redirect: "/something",
  middleware: [ function() { console.log("Middlware!"); } ],
  action: function(request, callback) {
    request.session.i++;
    // throw new Error();
    return callback(null, { foo: "bar" });
  }
};
