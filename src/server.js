#!/usr/bin/env node

  ///////////////
 // constants //
///////////////
HOST = null; // localhost
PORT = 8124;

  ///////////////////////
 // private variables //
///////////////////////

var fs = require("fs")
  , repl = require("repl")

  , bughouse = require("./bughouse")
  , getopt = require("v8cgi/lib/getopt.js").GetOpt
  , handler = require("./handler")
  , io = require("socket.io")
  , log = require("./log");

  //////////
 // main //
//////////

// handle options
var opts = new getopt();
opts.add("logfile", "Set the location of the log file", "", "l", "logfile", getopt.REQUIRED_ARGUMENT);

opts.parse(process.argv);

if (opts.get("logfile")) {
  log.location = opts.get("logfile");
}

// set cwd to file path so static handler can find the files
var file = process.argv[1];
process.chdir(file.substring(0, file.lastIndexOf("/")));

// listeneners
handler.listen(Number(process.env.PORT || PORT), HOST);
socket = io.listen(handler.server, { log: log.info, transports: ['websocket', 'xhr-multipart', 'xhr-polling', 'jsonp-polling']});

// static requests
handler.get("/", handler.staticHandler("index.html"));

handler.get("/board.js", handler.staticHandler("board.js"));
handler.get("/client.js", handler.staticHandler("client.js"));
handler.get("/client.css", handler.staticHandler("client.css"));

handler.get("/lib/socket.io.js", handler.staticHandler("./../node_modules/socket.io/support/socket.io-client/socket.io.js"));

handler.get("/lib/jquery-1.4.2.min.js", handler.staticHandler("lib/jquery-1.4.2.min.js"));
handler.get("/lib/jquery-ui-1.8.5.custom.min.js", handler.staticHandler("lib/jquery-ui-1.8.5.custom.min.js"));
handler.get("/lib/awesome-buttons/awesome-buttons.css", handler.staticHandler("lib/awesome-buttons/awesome-buttons.css"));

// sockets
socket.on("connection", function(client) {
  client.on("message", function(obj) {
    log.debug("websocket hit: " + JSON.stringify(obj));
    bughouse.handle_message(client, obj);
  });
});

socket.on("clientDisconnect", function(client) {
  bughouse.handle_disconnect(client.sessionId);
});

// repl
repl.start("bugd> ");
