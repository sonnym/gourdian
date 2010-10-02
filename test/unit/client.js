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
  var run = 0
    , message = { action: "join", data: { name: "anonymous" } };

  client_sock.addListener('data', function(buf) {
    // can safely assume we are connected
    if (run == 0) {
      run = 1;
    }
  });
}

exports.two_clients_make_a_game = function() {
  var client_sock2 = new new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf")
    , message = { action: "join", data: { name: "anonymous" } };

  client_sock.addListener("data", function(buf) {
    socket_send(client_sock, message);

    client_sock2.addListener("dat", function(buf2) {
        socket_send(client_sock2, message);
      
    });
  });
}

function socket_send(c, o) {
  var m = JSON.stringify(o);
  c.send("~m~" + (m.length + 3) + "~m~~j~" + m);
}
