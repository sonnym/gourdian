  ///////////////////////
 // private variables //
///////////////////////
var Cookies = require("cookies")
  , io = require("socket-io")
  , static_handler = require("node-static")
  , lib_path = path.join(Gourdian.ROOT, "lib")
  , transporter = require("transporter/lib/jsgi/transporter.js").Transporter({url: "/shared/", paths: [lib_path]});

  /////////////////
 // constructor //
/////////////////
var Server = function(logfile, port, base_path) {
  Gourdian.logger.separator();
  Gourdian.logger.info("New server instantated on port " + port);

  if (logfile) Gourdian.logger.location = logfile;

  this._port = port ? port : 8124
  this._base_path = base_path ? base_path : Gourdian.ROOT;

  this._http_server = null;
  this._http_server_bound_to_port = false;

  this._cookies = [];
};

module.exports = Server;

  ////////////////////
 // public methods //
////////////////////
Server.prototype.__defineGetter__("port", function() { return this._port });
Server.prototype.__defineGetter__("bound_to_port", function() { return this._http_server_bound_to_port });

Server.prototype.start = function() {
  Gourdian.logger.info("Attempting to start server from base path: " + this._base_path);

  this._config = new Config(this._base_path);
  this._router = new Router(this._base_path);
  this._controller_loader = new ControllerLoader(this._base_path);

  Server.prototype.start_http_server.call(this);
  //start_sockets(); // currently interferes with other http server
}

Server.prototype.start_http_server = function() {
  if (!this._router.need_http_server) {
    Gourdian.logger.info("No HTTP routes defined; HTTP server will not be started.");
    return;
  }

  // separate static and dynamic HTTP requests; order of precedence is: 1) specific files, 2) dynamic content, 3) root file server, 4) transporter fallback
  var file_server;
  if (this._router.root || (this._router.files && this._router.files.length > 0)) {
    var public_path = path.join(this._base_path, this._router.root.root);
    Gourdian.logger.info("Starting static file server at: " + this._base_path)

    file_server = new static_handler.Server(this._base_path);
  } else {
    Gourdian.logger.info("No root or file paths found, static file server will not be stared");
  }

  var self = this;

  this._http_server = require("http").createServer(function(request, response) {
    var request_body = "";
    request.addListener("data", function(chunk) { request_body += chunk });

    request.addListener("end", function() {
      var action_route = self._router.lookup_action_route(request.url)
        , file_route = self._router.lookup_file_route(request.url)
        , in_root = self._router.in_root(request.url);

      // routes for specific static files / file server root folder
      if (file_server && (file_route || in_root)) {
        if (file_route) {
          var path_to_serve = file_route.file
        } else if (in_root) {
          var path_to_serve = path.join(self._router.root.root, url.parse(request.url).pathname);
          if (url.parse(request.url).pathname === "/")  path_to_serve = path.join(path_to_serve, "index.html");
        }
        Gourdian.logger.info("Serving file: " + path_to_serve);
        file_server.serveFile(path_to_serve, 200, { }, request, response);

      // routes for dynamically generated content
      } else if (action_route) {
        Gourdian.logger.info("Serving action: " + action_route.controller + "." + action_route.action);
        self._controller_loader.run(action_route, response);

      // transporter fallback - if transporter fails to find the module, sends a 404 as well
      } else if (file_server) {
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
  });

  this._http_server.addListener("request", function(request, response) {
    Gourdian.logger.info("HTTP request: " + JSON.stringify(request.url));
  });

  this._http_server.listen(this._port, function() {
    Gourdian.logger.info("HTTP server successfully bound to port: " + self._port);

    self._http_server_bound_to_port = true;
  });
}

function start_sockets() {
  if (!this._router.need_socket_server) {
    Gourdian.logger.info("No socket routes defined; Socket.IO will not be started");
    return;
  }

  // need a defined http server for socket.io to hook into for backwards compatibility
  if (this._http_server === undefined) {
    var http_server = require("http").createServer();
    http_server.listen(this._port);
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
