module.exports = ServerTest = function() {
  IntegrationTest.call(this);

  var async = this.start();

  this.server_responds_to_nonexistent_static_file_request_with_a_404 = function() {
    this.get("/dne.html", function(response) {
      assert.equal(response.statusCode, 404);
      async.finish();
    });
  }

  this.server_responds_to_static_file_request = function() {
    this.get("/index.html", function(response) {
      assert.equal(response.statusCode, 200);
      async.finish();
    });
  }

  this.server_responds_to_top_level_request = function() {
    this.get("/", function(response) {
      assert.equal(response.statusCode, 200);
      async.finish();
    });
  }

  this.server_responds_to_unchunked_dynamic_requests = function() {
    this.get("/welcome", function(response) {
      assert.equal(response.statusCode, 200);
      async.finish();
    });
  }

  this.server_responds_to_chunked_dynamic_requests_via_template_loader = function() {
    this.get("/streaming", function(response) {
      assert.equal(response.complete, false);
      assert.equal(response.headers["transfer-encoding"], "chunked");
      assert.equal(response.statusCode, 200);

      response.on("end", function() {
        assert.equal(response.complete, true);
        async.finish();
      });
    });
  }

  this.server_gets_a_cookie_when_going_to_the_proper_url = function() {
    this.get("/set", function(response) {
      assert.equal(response.headers["set-cookie"][0], "_id=nada; path=/; httponly");
      async.finish();
    });
  }
}
inherits(ServerTest, IntegrationTest);
