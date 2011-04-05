#!/usr/bin/env node

  ///////////////
 // constants //
///////////////
PORT = 8124;

  ///////////////////////
 // private variables //
///////////////////////

var fs = require("fs")
  , http = require("http")
  , path = require("path")
  , repl = require("repl")

  , getopt = require("v8cgi/lib/getopt.js").GetOpt
  , io = require("socket.io")
  , static = require("node-static")

  , gourdian = require("./gourdian")
  , bughouse = require("./../app/c/bughouse")

  , lib_path = path.join(__dirname, "..", "lib")
  , transporter = require("transporter/lib/jsgi/transporter.js").Transporter({url: "/shared/", paths: [lib_path]});

  //////////
 // main //
//////////

bughouse.gourdian = gourdian;

// global exception handling
process.on("uncaughtException", function(error) {
  gourdian.logger.fatal("Caught exception: " + error + "\n" + error.stack);
});

// handle options
var opts = new getopt();
opts.add("logfile", "Set the location of the log file", "", "l", "logfile", getopt.REQUIRED_ARGUMENT);

opts.parse(process.argv);

if (opts.get("logfile")) {
  gourdian.logger.location = opts.get("logfile");
}

// HTTP requests
var file_server = new static.Server("./public");

var http = require("http");
var http_server = http.createServer(function(request, response) {
  request.addListener("end", function() {

    // special paths
    if (require("url").parse(request.url).pathname == "/transporter/receiver.js") {
      file_server.serveFile("./../node_modules/transporter/lib/receiver.js", 200, { }, request, response);
    } else if (require("url").parse(request.url).pathname == "/lib/socket.io.js") {
      file_server.serveFile("./../node_modules/socket.io/support/socket.io-client/socket.io.js", 200, { }, request, response);

    // public folder
    } else {
      file_server.serve(request, response, function (error, result) {
        // transporter fallback - if transporter fails to find the module, sends a 404 as well
        if (error && error.status === 404) {
          request.pathInfo = request.url; // transporter expects the pathInfo property

          var tp = transporter(request)
            , tp_body = "";

          tp.body.forEach(function(body_part) {
            tp_body += body_part;
          });

          tp.headers["Content-Length"] = tp_body.length;

          response.writeHead(tp.status, tp.headers);
          response.end(tp_body);
        }
      });
    }
  });
});

http_server.addListener("request", function(request, response) {
  gourdian.logger.debug("HTTP request: " + JSON.stringify(request.url));
});

http_server.listen(PORT);

gourdian.logger.info("HTTP server listening on: " + PORT.toString());

// sockets
gourdian.socket = io.listen(http_server, { log: gourdian.logger.info, transports: ["websocket", "xhr-multipart", "xhr-polling", "jsonp-polling"]});

gourdian.socket.on("connection", function(client) {
  gourdian.logger.debug("Socket connection: " + client.sessionId);

  client.on("message", function(obj) {
    gourdian.logger.debug("Socket message: " + JSON.stringify(obj));
    bughouse.handle_message(client, obj);
  });
});

gourdian.socket.on("clientDisconnect", function(client) {
  gourdian.logger.debug("Socket disconnection: " + client.sessionId);
  bughouse.handle_disconnect(client);
});

// repl
repl.start("bugd> ");
