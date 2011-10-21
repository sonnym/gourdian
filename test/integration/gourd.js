module.exports = GourdTest = function() {
  IntegrationTest.call(this);

  var async = this.start()
    , self = this;

  this.gourd_responds_to_unchunked_dynamic_requests = function() {
    this.get("/gourd_resource", function(response) {
      var r_body = "";
      response.on("data", function(d) { r_body += d });
      response.on("end", function() {
        assert.equal(response.statusCode, 200);
        assert.equal(r_body, "hello");
        async.finish();
      });
    });
  };
}
inherits(GourdTest, IntegrationTest)
