var assert = require("assert")
  , http = require("http")
  , sys = require("sys")
  , WebSocket = require("./../lib/node-websocket-client/lib/websocket").WebSocket

  , client_http = http.createClient(8124)
  , client_sock = new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf");

exports.can_fetch_index = function() {
  var request = client_http.request("GET", "/");

  request.end();
  request.on("response", function(response) {
    assert.equal(response.statusCode, 200);
  });
}

exports.can_connect_via_websocket = function() {
  client_sock.addListener('data', function(buf) {
    assert.notEqual(buf.length, 0);
  });
}

exports.can_join_game = function() {
  var run = 0;
  client_sock.addListener('data', function(buf) {
    // can safely assume we are connected
    if (run == 0) {
      var message = JSON.stringify({ action: "join", data: { name: "anonymous" } });
      client_sock.send("~m~" + (message.length + 3) + "~m~~j~" + message);
      run = 1;
    }
  });
}
