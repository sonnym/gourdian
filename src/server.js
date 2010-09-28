(function() {
  HOST = null; // localhost
  PORT = 8124;

  var starttime = (new Date()).getTime()
    , handler = require("./handler")
    , log = require("./log")
    , io = require("./lib/socket.io")


  // listen

  handler.listen(Number(process.env.PORT || PORT), HOST);
  socket = io.listen(handler.server, { log: log.info });

  // game state

  var bughouse = new function() {
    var games = []
      , waiting = [];

    var game = new function() {
      return { white: "", black: "", fen: "" }
    }
  };

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
      if (obj.action == "join") {
        var name = obj.data.name
          , color = "w";
        //, color = (Math.floor(Math.random()*2) == 0) ? "w" : "b";
        //
        log.info("user with name " + name + " joined; assigned: " + color);

        client.send({color: color});
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
})();
