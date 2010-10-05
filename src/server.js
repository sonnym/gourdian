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

  , bughouse = require("./bughouse");

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

        , data = bughouse.join(sid, name);

      if (data) {
        var game = data.game
          , opp_id = data.opp
          , opp = socket.getClient(opp_id)
          , color = data[sid]
          , opp_color = color == "w" ? "b" : "w";

        log.info("user with name " + name + ", sid " + sid + " joined; assigned: " + color + "; oppnent: " + opp_id + " " + opp_color);

        opp.send({game: game, color: opp_color});
        client.send({game: game, color: color});
      } else {
        log.info("user with name " + name + " joined; held");
        client.send({hold: 1});
      }
    } else if (obj.action == "kibitz") {
      var game = Math.floor(Math.random() * games.length);

      client.send({kibitz: 1, game: game});
    } else if (obj.action == "pos") {
      var fen = obj.data.fen
        , sid = client.sessionId
        , data = bughouse.update(sid, fen)
        , opp_id = data.opp_id
        , opp = socket.getClient(opp_id)

      opp.send({game: data.game, fen: fen});

      // TODO: send to adjacent players and adjacent kibitzers

      log.info("recieved updated fen for client with sid: " + sid + " ; fen: " + fen + "; opp " + opp_id);
    }
  });
});
