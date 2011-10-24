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

  this.can_fetch_transporter_include = function() {
    this.get("/lib/transporter/receiver.js", function(response) {
      assert.equal(response.statusCode, 200);
      async.finish();
    });
  }

  this.can_fetch_a_shared_resource_from_the_server = function() {
    this.get("/lib/shared.js", function(response) {
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

  this.server_can_access_params_from_query_string = function() {
    this.get("/params?id=secret", function(response) {
      assert.equal(response.statusCode, 200);

      var data = "";
      response.on("data", function(d) { data += d });

      ext.Sync.wait_for(function() { return data.length === 6 }, function() {
        assert.equal(data, "secret");
        async.finish();
      });
    });
  }
}
inherits(ServerTest, IntegrationTest);
