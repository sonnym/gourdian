module.exports = ServerSocketIoTest = function() {
  IntegrationTest.call(this);

  var async = this.start();

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
      assert.ok(self._server._io.connected[self._client.sid])
      async.finish();
    });
  }

  this.socket_io_delivers_client_side_include = function() {
    this.get("/socket.io/socket.io.js", function(response) {
      response.on("end", function() {
        assert.equal(response.statusCode, 200);
        async.finish();
      });
    });
  }

  this.client_can_send_message_to_socket_io = function() {
    var self = this
      , messages = 0;

    this.ws_connect(function() {
      self._client._socket.packet({ type: "event", name: "eidolon", endpoint: "" });
      self._client._socket.on("message", function(msg) {
        if (msg.type === "connect" || msg.type === "heartbeat") return;

        assert.equal(msg.type, "message");
        assert.equal(msg.data, "noumenon");

        self._client._socket.close();
        async.finish();
      });
    });
  }

  this.client_can_send_authorization_cookie_header_with_handshake = function() {
    var self = this;
    this.get("/store/save", function(response) {
      var cookie_parts = response.headers["set-cookie"][0].split("; ")
        , id_part = cookie_parts[0]
        , cookie_id = id_part.split("=")[1];

      self.ws_handshake({headers: {"Cookie": cookie_id} }, function() {
        self.ws_send_packet({ type: "event", name: "check_session", endpoint: "" });
        self._client._socket.on("message", function(msg) {
          if (msg.type !== "connect" && msg.type !== "heartbeat") {
            assert.equal(msg.data, "world");
            async.finish();
          }
        });
      });
    });
  }
}
inherits(ServerSocketIoTest, IntegrationTest);
