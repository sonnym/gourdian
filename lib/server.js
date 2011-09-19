  ///////////////////////
 // private variables //
///////////////////////
var Cookies = require("cookies")
  , io = require("socket.io")
  , static_handler = require("node-static")
  , lib_path = path.join(Gourdian.ROOT, "lib")
  , transporter = require("transporter/lib/jsgi/transporter.js").Transporter({url: "/shared/", paths: [lib_path]});

  /////////////////
 // constructor //
/////////////////
var Server = function(logfile, port, base_path) {
  if (logfile) Gourdian.logger.location = logfile;

  Gourdian.logger.separator();
  Gourdian.logger.info("New server instantiated for port " + port);

  this._port = port ? port : 8124
  this._base_path = base_path ? base_path : Gourdian.ROOT;

  this._http_server = null;
  this._io = null;
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

  this.setup_http_server();
  this.setup_socket_server();
  this.start_http_server();
}

Server.prototype.stop = function() {
  Gourdian.logger.info("Stopping server serving base path: " + this._base_path + " on port: " + this._port);

  if (this._http_server) this._http_server.close();
}

Server.prototype.setup_http_server = function() {
  if (!this._router.need_http_server) {
    Gourdian.logger.info("No HTTP routes defined; HTTP server will not be started.");
    return;
  }

  // separate static and dynamic HTTP requests; order of precedence is: 1) specific files, 2) dynamic content, 3) root file server, 4) transporter fallback
  var file_server;
  if (this._router.root) {
    var public_path = path.join(this._base_path, this._router.root.root);
    Gourdian.logger.info("Starting static file server at: " + this._base_path)

    file_server = new static_handler.Server(this._public_path);
  } else {
    Gourdian.logger.info("No root paths found, static file server will not be stared");
  }

  var self = this;

  this._http_server = http.createServer(function(request, response) {
    var cookies = new Cookies(request, response, {});
    if (url.parse(request.url).pathname == "/set") {
      cookies.set("_id", "nada", {httpOnly: true});
    }

    var request_body = "";
    request.on("data", function(chunk) { request_body += chunk });

    request.on("end", function() {
      var action_route = self._router.lookup_action_route(request.url)
        , in_root = self._router.in_root(request.url);

      // routes for specific static files / file server root folder
      if (file_server && in_root) {
        Gourdian.logger.info("Serving static file: " + path.join(public_path, url.parse(request.url).pathname));
        file_server.serve(request, response);
        response.end();

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
}

Server.prototype.setup_socket_server = function() {
  if (!this._router.need_socket_server) {
    Gourdian.logger.info("No socket routes defined; Socket.IO will not be started");
    return;
  }

  // need a defined http server for socket.io to hook into for backwards compatibility
  if (this._http_server === undefined) this._http_server = http.createServer();

  var self = this;

  // start socket.io
  this._io = io.listen(this._http_server, { "log level": 0 });
  this._io.server.on("close", function() {
    Gourdian.logger.info("Socket.IO server closed");
  });
  this._io.sockets.on("connection", function(socket) {
    Gourdian.logger.info("Socket connected (" + socket.id + ")");

    socket.on("test123", function() {
      socket.send("testsend");
    });

    socket.on("disconnect", function() {
      Gourdian.logger.info("Socket disconnected (" + socket.id + ")");
    });
  });
}

Server.prototype.start_http_server = function() {
  if (!this._http_server) return;

  this._http_server.addListener("request", function(request, response) {
    Gourdian.logger.info("HTTP request: " + JSON.stringify(request.url));
  });

  var self = this;
  this._http_server.listen(this._port, function() {
    Gourdian.logger.info("HTTP server successfully bound to port: " + self._port);

    self._http_server_bound_to_port = true;
  });
}
