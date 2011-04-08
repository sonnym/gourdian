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
  , url = require("url")

  , getopt = require("v8cgi/lib/getopt.js").GetOpt
  , io = require("socket.io")
  , static = require("node-static")

  , Router = require("./router")

  , router = new Router()
  , gourdian = require("./gourdian")

  , lib_path = path.join(gourdian.ROOT, "lib")
  , transporter = require("transporter/lib/jsgi/transporter.js").Transporter({url: "/shared/", paths: [lib_path]});

  //////////
 // main //
//////////

// global exception handling
process.on("uncaughtException", function(error) {
  gourdian.logger.fatal("Caught exception: " + error + "\n" + error.stack);
});

  /////////////
 // options //
/////////////
var opts = new getopt();
opts.add("logfile", "Set the location of the log file", "", "l", "logfile", getopt.REQUIRED_ARGUMENT);

opts.parse(process.argv);

if (opts.get("logfile")) {
  gourdian.logger.location = opts.get("logfile");
}

  /////////////////
 // controllers //
/////////////////
var controllers_dir = path.join(gourdian.ROOT, "app", "c")
  , controller_files = fs.readdirSync(controllers_dir)
  , controllers = {};

for (c in controller_files) {
  var controller_file = controller_files[c];

  if (path.extname(controller_file) != '.js') continue;

  var controller_index = controller_file.substring(0, controller_file.length - 3);

  controllers[controller_index] = require(path.join(controllers_dir, controller_file));
  controllers[controller_index].gourdian = gourdian;
}

  //////////
 // http //
//////////
if (router.routes.http && router.routes.http.length > 0) {
  var root_route = gourdian._.detect(router.routes.http, function(route) { return route.root })
    , file_routes = gourdian._.select(router.routes.http, function(route) { return route.file })

    , file_server = root_route ? new static.Server("./" + root_route.root) // new static.Server(path.join(gourdian.ROOT, root_route.root))
                               : new static.Server();

  var http_server = require("http").createServer(function(request, response) {
    request.addListener("end", function() {

      // routes for specific files
      var first_matching_route = gourdian._.detect(file_routes, function(route) { return url.parse(request.url).pathname == route.path });
      if (first_matching_route) {
        //file_server.serveFile(path.join(gourdian.ROOT, first_matching_route.file), 200, { }, request, response);
        file_server.serveFile("./../" + first_matching_route.file, 200, { }, request, response);

      // file server root folder
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
} else {
  gourdian.logger.info("No HTTP routes defined; HTTP server will not be started.");
}

  /////////////
 // sockets //
/////////////
if (router.routes.socket && router.routes.socket.length > 0 ) {
  // need a defined http server for socket.io to hook into for backwards compatibility
  if (http_server === undefined) {
    var http_server = require("http").createServer();
    http_server.listen(PORT);
  }

  // gather routes
  var catch_all_route = gourdian._.detect(router.routes.socket, function(route) { return route.message == "*" })
    , disconnection_route = gourdian._.detect(router.routes.socket, function(route) { return route.message == "disconnect" });

  // start socket.io
  gourdian.socket = io.listen(http_server, { log: gourdian.logger.info, transports: ["websocket", "xhr-multipart", "xhr-polling", "jsonp-polling"]});
  gourdian.socket.on("connection", function(client) {
    client.on("message", function(obj) {
      gourdian.logger.debug("Socket message from client " + client.sessionId + ": " + JSON.stringify(obj));

      controllers[catch_all_route.controller][catch_all_route.action](client, obj);
    });
  });

  if (disconnection_route) {
    gourdian.socket.on("clientDisconnect", function(client) {
      controllers[disconnection_route.controller][disconnection_route.action](client);
    });
  }
} else {
  gourdian.logger.info("No socket routes defined; Socket.IO not instantiated");
}

  //////////
 // repl //
//////////
repl.start("bugd> ");
