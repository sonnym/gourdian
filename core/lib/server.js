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
  , http_server_bound_to_port = false

  , config
  , router;

  /////////////////
 // constructor //
/////////////////
var Server = function(logfile, port, base_path) {
  Gourdian.logger.separator();
  Gourdian.logger.info("New server instantated on port " + port);

  if (logfile) Gourdian.logger.location = logfile;
  if (port) this.port = port;

  if (base_path) this.base_path = base_path;
  else this.base_path = __dirname;
};

module.exports = Server;

  ////////////////////
 // public methods //
////////////////////
Server.prototype.__defineGetter__("bound_to_port", function() { return http_server_bound_to_port });

Server.prototype.start = function() {
  Gourdian.logger.info("Attempting to start server from base path: " + this.base_path);

  config = new Config(this.base_path);
  router = new Router(this.base_path);
  controller_loader = new ControllerLoader(this.base_path);

  start_http_server(this.base_path, this.port);
  //start_sockets(); // currently interferes with other http server
}

  /////////////////////
 // private methods //
/////////////////////
function start_http_server(base_path, port) {
  if (!router.need_http_server) {
    Gourdian.logger.info("No HTTP routes defined; HTTP server will not be started.");
    return;
  }

  // separate static and dynamic HTTP requests; order of precedence is: 1) specific files, 2) dynamic content, 3) root file server, 4) transporter fallback
  var file_server;
  if (router.root) {
    var public_path = path.join(base_path, router.root);
    Gourdian.logger.info("Starting static file server at: " + public_path)

    file_server = new static_handler.Server("." + public_path);
  } else {
    Gourdian.logger.info("No root path found, static file server will not be stared");
  }

  var http_server = require("http").createServer(function(request, response) {
    var request_body = "";
    request.addListener("data", function(chunk) { request_body += chunk });

    request.addListener("end", function() {
      var action_route = router.lookup_action_route(request.url);

      // routes for specific static files
      if (file_server && router.file_route) {
        Gourdian.logger.info("Serving file: " + router.file_route);
        file_server.serveFile("./../" + router.file_route, 200, { }, request, response);

      // routes for dynamically generated content
      } else if (action_route) {
        Gourdian.logger.info("Serving action: " + action_route.controller + "." + action_route.action);
        controller_loader.run(action_route, response);

      // file server root folder
      } else if (file_server) {
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
    Gourdian.logger.info("HTTP request: " + JSON.stringify(request.url));
  });

  http_server.listen(port || DEFAULT_PORT, function() {
    Gourdian.logger.info("HTTP server successfully bound to port: " + port);
    http_server_bound_to_port = true;
  });
}

function start_sockets() {
  if (!router.need_socket_server) {
    Gourdian.logger.info("No socket routes defined; Socket.IO will not be started");
    return;
  }

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
}
