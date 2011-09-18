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

  this.socket_io_handles_http_requests_intended_for_it = function() {
    this.get("/socket.io/1", function(response) {
      var data = "";
      response.on("data", function(chunk) { data += chunk });

      response.on("end", function() {
        var data_parts = data.split(":");
        assert.equal(data_parts[3], "websocket,htmlfile,xhr-polling,jsonp-polling");

        var transports = data_parts[3].split(",");
        assert.equal(transports.length, 4);

        assert.equal(response.statusCode, 200);
        async.finish();
      });
    });
  }

  this.socket_io_can_be_connected_to_via_websocket = function() {
    var self = this;
    this.ws_connect(function() {
      assert.equal(self._server._io.server.connections, 2); // frankly not sure why 2
      assert.ok(self._server._io.connected[self._client.socket.sid])
      async.finish();
    });
  }

  /*
  this.socket_io_delivers_client_side_include = function() {
    this.get("/socket.io/socket.io.js", function(response) {
      response.on("end", function() {
        assert.equal(response.statusCode, 200);
        async.finish();
      });
    });
  }
  */

  this.client_can_send_message_to_socket_io = function() {
    this._timeout = 1000;
    var self = this
      , messages = 0;

    this.ws_connect(function() {
      self._client.socket.packet({ type: "event", name: "test123", endpoint: "" });
      self._client.socket.on("message", function(msg) {
        if (messages.length === 0) {
          messages++;
          return;
        }

        assert.equal(msg.type, "message");
        assert.equal(msg.data, "testsend");

        self._client.socket.close();
        async.finish();
      });
    });
  }
}
inherits(ServerTest, IntegrationTest);
