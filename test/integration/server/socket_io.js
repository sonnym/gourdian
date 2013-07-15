var Gourdian = require("./../../../lib/gourdian");

var config = Gourdian.Configuration;
config.base_path = require("path").join(Gourdian.ROOT, "test", "fixtures", "application");
config.rebuild_paths();

var IntegrationTest = require("./../../../lib/tests/integration");

exports.setUp = function(callback) {
  this.integration = new IntegrationTest();
  this.integration.start_server();
  callback();
}

exports.tearDown = function (callback) {
  this.integration.stop_server();
  callback();
}

exports.socket_io_handles_http_requests_intended_for_it = function(test) {
  this.integration.get("/socket.io/1", function(response) {
    var data = "";
    response.on("data", function(chunk) { data += chunk });

    response.on("end", function() {
      var data_parts = data.split(":");
      test.equal(data_parts[3], "websocket,xhr-polling,jsonp-polling,htmlfile");

      var transports = data_parts[3].split(",");
      test.equal(transports.length, 4);

      test.equal(response.statusCode, 200);
      test.done();
    });
  });
}

exports.socket_io_can_be_connected_to_via_websocket = function(test) {
  var self = this;
  this.integration.ws_connect(function() {
    test.equal(self.integration._server._io.server.connections, 1);
    test.ok(self.integration._server._io.connected[self.integration._client.sid])
    test.done();
  });
}

exports.socket_io_delivers_client_side_include = function(test) {
  this.integration.get("/socket.io/socket.io.js", function(response) {
    response.on("end", function() {
      test.equal(response.statusCode, 200);
      test.done();
    });
  });
}

exports.client_can_send_message_to_socket_io = function(test) {
  var self = this
    , messages = 0;

  this.integration.ws_connect(function() {
    self.integration._client._socket.packet({ type: "event", name: "eidolon", endpoint: "" });
    self.integration._client._socket.on("message", function(msg) {
      if (msg.type === "connect" || msg.type === "heartbeat") return;

      test.equal(msg.type, "message");
      test.equal(msg.data, "noumenon");

      self.integration._client._socket.close();
      test.done();
    });
  });
}

exports.client_can_send_authorization_cookie_header_with_handshake = function(test) {
  var self = this;
  this.integration.get("/store/save", function(response) {
    var cookie_parts = response.headers["set-cookie"][0].split("; ")
      , id_part = cookie_parts[0]
      , cookie_id = id_part.split("=")[1];

    self.integration.ws_handshake({headers: {"Cookie": cookie_id} }, function() {
      self.integration.ws_send_packet({ type: "event", name: "check_session", endpoint: "" });
      self.integration._client._socket.on("message", function(msg) {
        if (msg.type !== "connect" && msg.type !== "heartbeat") {
          test.equal(msg.data, "world");
          test.done();
        }
      });
    });
  });
}

exports.client_can_send_message_packets_to_the_server = function(test) {
  var self = this;
  this.integration.ws_handshake({}, function() {
    var secret = "" + Math.random();
    self.integration.ws_send_packet({ type: "json", data: { secret: secret } });
    self.integration._client._socket.on("message", function(msg) {
      if (msg.type === "heartbeat" || msg.type === "connect") return;

      test.equal(secret, msg.data);

      self.integration._client._socket.close();
      test.done();
    });
  });
}
