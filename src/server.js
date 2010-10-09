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

handler.get("/lib/jquery-1.4.2.min.js", handler.staticHandler("lib/jquery-1.4.2.min.js"));
handler.get("/lib/jquery-ui-1.8.5.custom.min.js", handler.staticHandler("lib/jquery-ui-1.8.5.custom.min.js"));
handler.get("/lib/awesome-buttons/awesome-buttons.css", handler.staticHandler("lib/awesome-buttons/awesome-buttons.css"));

// sockets
socket.on("connection", function(client) {
  client.on("message", function(obj) {
    log.debug("websocket hit: " + JSON.stringify(obj));

    var sid = client.sessionId;

    if (obj.action == "join") {
      var name = obj.data.name
        , data = bughouse.join(sid, name);

      if (data) {
        var gid = data.gid
          , opp_id = data.opp
          , opp = socket.getClient(opp_id)
          , color = data[sid]
          , opp_color = color == "w" ? "b" : "w";

        log.info("user with name " + name + ", sid " + sid + " joined; assigned: " + color + "; opponent: " + opp_id + " " + opp_color);

        client.send({play: 1, gid: gid, color: color, states: data.states});
        opp.send({play: 1, gid: gid, color: opp_color, states: data.states});
      } else {
        log.info("user with name " + name + " joined; held");
        client.send({hold: 1});
      }
    } else if (obj.action == "kibitz") {
      var states = bughouse.kibitz(sid, obj.data.name);

      client.send({ kibitz: 1, states: states });
    } else if (obj.action == "pos") {
      var from = obj.data.f
        , to = obj.data.t;

      bughouse.update(sid, from, to, function(data) {
        if (!data) return; // client disconnected during an update

        var gid = data.gid
          , opp_id = data.opp_id
          , opp = socket.getClient(opp_id)
          , state = data.state
          , watchers = data.watchers;

        opp.send({state: state });

        for (var i = 0, l = watchers.length; i < l; i++) {
          var watcher = socket.getClient(watchers[i]);
          if (watcher) watcher.send({state: state});
        }

        log.info("recieved move from client with sid: " + sid + "; from " + from + " to " + to + "; opp " + opp_id);
      });
    }
  });
});

socket.on("clientDisconnect", function(client) {
  bughouse.quit(client.sessionId);

  // TODO: send resignation updates
});
