HOST = null; // localhost
PORT = 8124

var starttime = (new Date()).getTime()
  , handler = require("./handler")
  , log = require("./log")
  , qs = require("querystring")
  , spawn = require("child_process").spawn
  , url = require("url")
  , sessions = require("./lib/node-sessions/session_manager.js")
  , session_manager = new sessions.SessionManager({lifetime: 1000, domain: HOST ? HOST : "127.0.0.1"});

var bughouse = new function() {
  var games = [];
};

handler.listen(Number(process.env.PORT || PORT), HOST);

// static requests
handler.get("/", handler.staticHandler("index.html"));

handler.get("/board.js", handler.staticHandler("board.js"));
handler.get("/client.js", handler.staticHandler("client.js"));
handler.get("/client.css", handler.staticHandler("client.css"));

handler.get("/lib/jquery-1.4.2.min.js", handler.staticHandler("lib/jquery-1.4.2.min.js"));
handler.get("/lib/jquery-ui-1.8.5.custom.min.js", handler.staticHandler("lib/jquery-ui-1.8.5.custom.min.js"));
handler.get("/lib/awesome-buttons/awesome-buttons.css", handler.staticHandler("lib/awesome-buttons/awesome-buttons.css"));

// dynamic requests
handler.post("/join", function(req, res) {
  session_manager.lookupSession(req, function(session) {
    var cookie = req.getCookie("SID");

    // perform check for session in case of expired cookie after server restart
    if (!cookie || !session) {
      session = session_manager.createSession();
      log.info("created session: " + session.sid);
      res.setCookie("SID", session.sid);
    }
  });

  var body = ""
  req.on("data", function(chunk) { body += chunk; });

  // wait until entire body is received, lest some of the body be missed
  req.on("end", function() {
    var name = qs.parse(body).name;
    log.info("user with name " + name + " joined");
    res.simpleJSON(200, { "color": "w" });
  });
});

handler.post("/fen", function(req, res) {
  session_manager.lookupSession(req, function(session) {
    if (!session) {
      res.simpleJSON(200, { "error": "session expired" });
      return;
    }

    var body = ""
    req.on("data", function(chunk) { body += chunk; });

    req.on("end", function() {
      var fen = qs.parse(body).fen;
      log.info("recieved updated fen for client with sid: " + session.sid + " ; fen: " + fen);

      res.simpleJSON(200, { "fen": "valid" });
    });
  });
});
