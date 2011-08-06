#!/usr/bin/env node

  ///////////////
 // constants //
///////////////
DEFAULT_PORT = 8124;

  ///////////////////////
 // private variables //
///////////////////////
var fs = require("fs")
  , http = require("http")
  , path = require("path")
  , repl = require("repl")
  , url = require("url")

  , GetOpt = require("v8cgi/lib/getopt.js").GetOpt
  , io = require("socket-io")
  , static = require("node-static")

  , gourdian = require("./gourdian")

  , Config = require("./config")
  , Router = require("./router")

  , config = new Config()
  , router = new Router()

  , lib_path = path.join(gourdian.ROOT, "lib")
  , transporter = require("transporter/lib/jsgi/transporter.js").Transporter({url: "/shared/", paths: [lib_path]});

  /////////////
 // globals //
/////////////
global.util = require("util")

global.Gourdian = gourdian;
global.Controller = require("./controller")

  //////////
 // main //
//////////

// global exception handling
process.on("uncaughtException", function(error) {
  gourdian.logger.fatal("Caught exception: " + error + "\n" + error.stack);
  console.log("Caught exception: " + error + "\n" + error.stack);
});

global.stop = function() { process.kill(process.pid, "SIGHUP") };

  /////////////
 // options //
/////////////
var opts = new GetOpt();
opts.add("logfile", "Set the location of the log file", "", "l", "logfile", GetOpt.REQUIRED_ARGUMENT);
opts.add("port", "Port HTTP server and Socket.IO will listen on", DEFAULT_PORT, "p", "port", GetOpt.REQUIRED_ARGUMENT);

try {
  opts.parse(process.argv);
} catch (e) {
  console.log(e + "\nGourdian server script usage: \n\n" + opts.help());
  return;
}

if (opts.get("logfile")) {
  gourdian.logger.location = opts.get("logfile");
}
var port = opts.get("port");

  /////////////////
 // controllers //
/////////////////
var controllers_dir = path.join(gourdian.ROOT, "app", "c");
if (path.existsSync(controllers_dir)) {
  var controller_files = fs.readdirSync(controllers_dir)
    , controllers = {};

  for (c in controller_files) {
    var controller_file = controller_files[c];

    if (path.extname(controller_file) != '.js') continue;

    var controller_index = controller_file.substring(0, controller_file.length - 3);

    // include controller and attach gourdian object
    controllers[controller_index] = require(path.join(controllers_dir, controller_file))();
    controllers[controller_index].gourdian = gourdian;

    // make all includes globally accessible
    for (var i = 0, l = config.includes.length; i < l; i++) {
      controllers[controller_index][gourdian._.keys(config.includes)[i]] = config.includes[i];
    }
  }
}

  //////////
 // http //
//////////
if (router.routes.http && router.routes.http.length > 0) {
  // separate static and dynamic HTTP requests; order of precedence is: 1) specific files, 2) dynamic content, 3) root file server, 4) transporter fallback
  var root_route = gourdian._.detect(router.routes.http, function(route) { return route.root })
    , file_routes = gourdian._.select(router.routes.http, function(route) { return route.file })
    , dynamic_routes = gourdian._.select(router.routes.http, function(route) { return route.controller && route.action })

    , file_server = root_route ? new static.Server("./" + root_route.root) // new static.Server(path.join(gourdian.ROOT, root_route.root))
                               : new static.Server();

  var http_server = require("http").createServer(function(request, response) {
    var request_body = "";
    request.addListener("data", function(chunk) { request_body += chunk });

    request.addListener("end", function() {
      var first_matching_file_route = gourdian._.detect(file_routes, function(route) { return url.parse(request.url).pathname === route.path })
        , first_matching_dynamic_route = gourdian._.detect(dynamic_routes, function(route) { return url.parse(request.url).pathname === route.path });

      // routes for specific static files
      if (first_matching_file_route) {
        //file_server.serveFile(path.join(gourdian.ROOT, first_matching_file_route.file), 200, { }, request, response);
        file_server.serveFile("./../" + first_matching_file_route.file, 200, { }, request, response);

      // routes for dynamically generated content
      } else if (first_matching_dynamic_route) {
        var action_response = controllers[first_matching_dynamic_route.controller][first_matching_dynamic_route.action]();

        // full response
        if (typeof action_response === "string") {
          response.writeHead(200, { "Content-Length": action_body.length, "Content-Type": "text/html" });
          response.end(action_body);

        // chunked response
        } else if (typeof action_response === "object") {
          response.writeHead(200, { "Content-Type": "text/html" });

          // function must be an event emitter w/ data, end, and error
          action_response.on("data", function(data) {
            response.write(data);
          });
          action_response.on("end", function() {
            response.end();
          });
          action_response.on("error", function(error) {
            gourdian.logger.info("Error: " + error);
          });
        }

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

  http_server.listen(port);

  gourdian.logger.info("HTTP server listening on: " + port.toString());
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
    http_server.listen(port);
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
repl.start("gourd> ");
