var assert = require("assert")
  , crafty = require("./..//lib/crafty")
  , http = require("http")
  , sys = require("sys")
  , WebSocket = require("./../lib/node-websocket-client/lib/websocket").WebSocket

  , client_http = http.createClient(8124)

exports.can_fetch_index = function() {
  var request = client_http.request("GET", "/");

  request.end();
  request.on("response", function(response) {
    assert.equal(response.statusCode, 200);
  });
}

exports.can_connect_via_websocket = function() {
  /*
  var client_sock = new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf");

  client_sock.addListener('data', function(buf) {
    assert.notEqual(buf.length, 0);
  });
  */
}

// async tests do not work yet, but can be verified from logs
exports.can_join_game = function() {
  /*
  var client_sock = new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf")
    , message_sent = false
    , message = { action: "join", data: { name: "anonymous" } }
    , receipt = { hold: 1};

  client_sock.addListener('data', function(buf) {
    // can safely assume we are connected after first transmission
    if (!message_sent) {
      message_sent = true;
      socket_send(client_sock, message);
    }
  });

  client_sock.onmessage = function(m) {
    var obj = message_parse(m);
    if (obj.hold) {
      assertEqual(obj, receipt);
    }
  }
  */
}

exports.two_clients_make_a_game = function() {
  /*
  var client_sock = new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf")
    , client_sock2 = new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf")
    , message = { action: "join", data: { name: "anonymous" } }
    , message_sent = [false, false]

  client_sock.addListener("data", function(buf) {
    if (!message_sent[0]) {
      socket_send(client_sock, message);
      message_sent[0] = true;
    }

    client_sock2.addListener("data", function(buf2) {
      if (!message_sent[1]) {
        socket_send(client_sock2, message);
        message_sent[1] = true;
      }
    });
  });
  */
}

exports.player_assigned_white_can_move = function() {
  /*
  var client_sock = new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf")
    , client_sock2 = new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf")
    , join_message = { action: "join", data: { name: "anonymous" } }
    , join_message_sent = [false, false]
    , update_position_message = function(fen) { return { action: "pos", data: { fen: fen } } };

  // join
  client_sock.addListener("data", function(buf) {
    if (!join_message_sent[0]) {
      socket_send(client_sock, join_message);
      join_message_sent[0] = true;
    }

    client_sock2.addListener("data", function(buf2) {
      if (!join_message_sent[1]) {
        socket_send(client_sock2, join_message);
        join_message_sent[1] = true;
      }
    });
  });

  // play
  client_sock.onmessage = client_sock2.onmessage = function(m) {
    var obj = message_parse(m);
    if (!obj.color || obj.color != "w") return;

    socket_send(this, update_position_message("rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq e3 0 1"));
  }
  */
}

exports.two_players_can_play_a_game = function() {
  var client_sock = new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf")
    , client_sock2 = new WebSocket("ws://127.0.0.1:8124/socket.io/websocket", "borf")
    , join_message = { action: "join", data: { name: "anonymous" } }
    , join_message_sent = [false, false]
    , update_position_message = function(fen) { return { action: "pos", data: { fen: fen } } };

  // join
  client_sock.onopen = function() {
    if (!join_message_sent[0]) {
      socket_send(client_sock, join_message);
      join_message_sent[0] = true;
    }
  }

  client_sock2.onopen = function() {
    if (!join_message_sent[1]) {
      socket_send(client_sock2, join_message);
      join_message_sent[1] = true;
    }
  }

  // play
  client_sock.onmessage = client_sock2.onmessage = function(m) {
    var obj = message_parse(m)
      , sock = this;

    if (obj.color && obj.color == "w") {
      socket_send(sock, update_position_message("rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq e3 0 1"));
    } else if (obj.fen) {
      crafty.move( "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                 , parseInt(obj.game)
                 , function(new_fen) {
                     socket_send(sock, update_position_message(new_fen));
                   }
                 );
    }
  }
}

// helpers
function socket_send(c, o) {
  var m = JSON.stringify(o);
  c.send("~m~" + (m.length + 3) + "~m~~j~" + m);
}

function message_parse(m) {
  var parsed = m.data.substring(3)
    , m_len_end = parsed.indexOf("~")
    // , m_len = parsed.substring(m_len_end) // unused
    , parsed = parsed.substring(m_len_end + 6);

  return eval("(" + parsed + ")"); // assume json
}
