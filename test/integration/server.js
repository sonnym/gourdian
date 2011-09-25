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

  this.client_gets_a_cookie_on_request = function() {
    var self = this;
    this.get("/index.html", function(response) {
      var cookie_id = self._client.cookie;

      // 32 byte sha1
      assert.equal(cookie_id.length, 32);
      async.finish();
    });
  }

  this.client_gets_a_cookie_only_on_first_request = function() {
    var self = this;
    this.get("/index.html", function() {
      self.get("/index.html", function(response) {
        assert.ok(response.headers["set-cookie"] === undefined);
        async.finish();
      });
    });
  }

  this.client_can_save_information_in_a_session = function() {
    var self = this;
    this.get("/store/save", function() {
      assert.equal(self._server._session_store.get(self._client.cookie).hello, "world");
      async.finish();
    });
  }

  this.client_can_save_and_retrieve_data_in_a_session = function() {
    var self = this;
    this.get("/store/save", function() {
      assert.equal(self._server._session_store.get(self._client.cookie).hello, "world");

      self.get("/store/check", function(response) {
        response.on("data", function(data) {
          assert.equal(data, "world");
          async.finish();
        });
      });
    });
  }
}
inherits(ServerTest, IntegrationTest);
