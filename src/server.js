  ///////////////
 // constants //
///////////////
HOST = null; // localhost
PORT = 8124;

  ///////////////////////
 // private variables //
///////////////////////

var starttime = (new Date()).getTime()
  , handler = require("./handler")
  , log = require("./log")
  , io = require("./lib/socket.io")

// game state

var bughouse = (function() {
  var games = []
    , waiting = [];

  var game = function(w, b) {
    return { white: 0, black: 0, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" }
  }

  return {
    join : function(sid) {
      if (waiting.length > 0) {
        var opp = waiting.pop()
          , color = (Math.floor(Math.random()*2) == 0) ? "w" : "b";

        if (color == "w") new_game(sid, opp);
        else new_game(opp, sid);

        // tell opponent their color
        socket.broadcast({color: ((color == "w") ? "b" : "w")});

        return color;
      } else {
        waiting.push(sid);
        return null;
      }
    }
  }

  function new_game(w, b) {
    games.push(new game(w, b));
  }
})();

  ////////////////
 // statements //
////////////////

// listen
handler.listen(Number(process.env.PORT || PORT), HOST);
socket = io.listen(handler.server, { log: log.info, transports: ['websocket', 'xhr-multipart', 'xhr-polling', 'jsonp-polling']});

// static requests
handler.get("/", handler.staticHandler("index.html"));

handler.get("/board.js", handler.staticHandler("board.js"));
handler.get("/client.js", handler.staticHandler("client.js"));
handler.get("/client.css", handler.staticHandler("client.css"));

handler.get("/lib/socket.io.js", handler.staticHandler("lib/socket.io/support/socket.io-client/socket.io.js"));
handler.get("/lib/web-socket-js/WebSocketMain.swf", handler.staticHandler("lib/web-socket-js/WebSocketMain.swf"));

handler.get("/lib/jquery-1.4.2.min.js", handler.staticHandler("lib/jquery-1.4.2.min.js"));
handler.get("/lib/jquery-ui-1.8.5.custom.min.js", handler.staticHandler("lib/jquery-ui-1.8.5.custom.min.js"));
handler.get("/lib/awesome-buttons/awesome-buttons.css", handler.staticHandler("lib/awesome-buttons/awesome-buttons.css"));

// sockets
socket.on("connection", function(client) {
  client.on("message", function(obj) {
    log.debug("websocket hit: " + JSON.stringify(obj));

    if (obj.action == "join") {
      var name = obj.data.name
        , sid = client.sessionId

        , color = bughouse.join(sid);

      log.info("user with name " + name + " joined; assigned: " + color);

      if (color) client.send({color: color});
      else client.send({hold: 1});
    } else if (obj.action == "pos") {
      var crafty = require("./crafty")
        , fen = obj.data.fen
        , sid = client.sessionId;

      log.info("recieved updated fen for client with sid: " + client.sessionId + " ; fen: " + fen);

      crafty.move( fen
                 , client.sessionId
                 , function(new_fen) {
                     log.debug("move callback");
                     client.send({fen: new_fen});
                   }
                 );
    }
  });
});
