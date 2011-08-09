  ///////////////
 // constants //
///////////////
DEFAULT_PORT = 8124;

  ///////////////////////
 // private variables //
///////////////////////
var io = require("socket-io")
  , static_handler = require("node-static")
  , lib_path = path.join(Gourdian.ROOT, "lib")
  , transporter = require("transporter/lib/jsgi/transporter.js").Transporter({url: "/shared/", paths: [lib_path]})

  , port = DEFAULT_PORT

  , config
  , router;

  /////////////////
 // constructor //
/////////////////
var Server = function(logfile, port) {
  if (logfile) Gourdian.logger.location = this.logfile;
  if (this.port) port = this.port;

  config = new Config();
  router = new Router();
};

module.exports = Server;

  ////////////////////
 // public methods //
////////////////////
Server.prototype.start = function() {
  load_controllers();
  start_http_server();
  start_sockets();

  return true;
}

Server.prototype.stop = function() {
  return true;
}

  /////////////////////
 // private methods //
/////////////////////
function load_controllers() {
  var controllers_dir = path.join(Gourdian.ROOT, "app", "c");
  if (path.existsSync(controllers_dir)) {
    var controller_files = fs.readdirSync(controllers_dir)
      , controllers = {};

    for (c in controller_files) {
      var controller_file = controller_files[c];

      if (path.extname(controller_file) != '.js') continue;

      var controller_index = controller_file.substring(0, controller_file.length - 3);

      // include controller and attach gourdian object
      controllers[controller_index] = require(path.join(controllers_dir, controller_file))();
      controllers[controller_index].gourdian = Gourdian;

      /*
      // make all includes globally accessible
      for (var i = 0, l = config.includes.length; i < l; i++) {
        controllers[controller_index][Gourdian._.keys(config.includes)[i]] = config.includes[i];
      }
      */
    }
  }
}

function start_http_server() {
  var routes = router.get_routes();

  if (routes && routes.http && routes.http.length > 0) {
    // separate static and dynamic HTTP requests; order of precedence is: 1) specific files, 2) dynamic content, 3) root file server, 4) transporter fallback
    var root_route = Gourdian._.detect(routes.http, function(route) { return route.root })
      , file_routes = Gourdian._.select(routes.http, function(route) { return route.file })
      , dynamic_routes = Gourdian._.select(routes.http, function(route) { return route.controller && route.action })

      , file_server = root_route ? new static_handler.Server("./" + root_route.root) // new static_handler.Server(path.join(gGurdian.ROOT, root_route.root))
                                 : new static_handler.Server();

    var http_server = require("http").createServer(function(request, response) {
      var request_body = "";
      request.addListener("data", function(chunk) { request_body += chunk });

      request.addListener("end", function() {
        var first_matching_file_route = Gourdian._.detect(file_routes, function(route) { return url.parse(request.url).pathname === route.path })
          , first_matching_dynamic_route = Gourdian._.detect(dynamic_routes, function(route) { return url.parse(request.url).pathname === route.path });

        // routes for specific static files
        if (first_matching_file_route) {
          //file_server.serveFile(path.join(Gourdian.ROOT, first_matching_file_route.file), 200, { }, request, response);
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
              Gourdian.logger.info("Error: " + error);
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
      Gourdian.logger.debug("HTTP request: " + JSON.stringify(request.url));
    });

    http_server.listen(port);

    Gourdian.logger.info("HTTP server listening on: " + port.toString());
  } else {
    Gourdian.logger.info("No HTTP routes defined; HTTP server will not be started.");
  }
}

function start_sockets() {
  var routes = router.get_routes();

  if (routes && routes.socket && router.routes.socket.length > 0 ) {
    // need a defined http server for socket.io to hook into for backwards compatibility
    if (http_server === undefined) {
      var http_server = require("http").createServer();
      http_server.listen(port);
    }

    // gather routes
    var catch_all_route = Gourdian._.detect(routes.socket, function(route) { return route.message == "*" })
      , disconnection_route = Gourdian._.detect(routes.socket, function(route) { return route.message == "disconnect" });

    // start socket.io
    Gourdian.socket = io.listen(http_server, { log: Gourdian.logger.info, transports: ["websocket", "xhr-multipart", "xhr-polling", "jsonp-polling"]});
    Gourdian.socket.on("connection", function(client) {
      client.on("message", function(obj) {
        Gourdian.logger.debug("Socket message from client " + client.sessionId + ": " + JSON.stringify(obj));

        controllers[catch_all_route.controller][catch_all_route.action](client, obj);
      });
    });

    if (disconnection_route) {
      Gourdian.socket.on("clientDisconnect", function(client) {
        controllers[disconnection_route.controller][disconnection_route.action](client);
      });
    }
  } else {
    Gourdian.logger.info("No socket routes defined; Socket.IO not instantiated");
  }
}