/* dependencies */
var Cookies = require("cookies")
  , io = require("socket.io")
  , Transporter = require("transporter/lib/jsgi/transporter.js").Transporter;

/* constructor */
module.exports = Server = function(logfile, port, base_path) {
  if (logfile) Gourdian.logger.location = logfile;

  Gourdian.logger.separator();

  this._port = port ? port : 8124
  this._base_path = base_path ? base_path : Gourdian.ROOT;

  this._http_server = null;
  this._io = null;
  this._http_server_bound_to_port = false;

  this._handlers = [new StaticHandler()];

  this._cookies = [];
};


/* @returns {Number} port for http server */
Server.prototype.__defineGetter__("port", function() { return this._port });

/* @returns {Boolean} whether http server is bound to port */
Server.prototype.__defineGetter__("bound_to_port", function() { return this._http_server_bound_to_port });

/* start the http server
 *
 * @api public
 */
Server.prototype.start = function() {
  Gourdian.logger.info("Starting server on port " + this._port + " serving: " + this._base_path);

  this._config = new Config(this._base_path);
  this._router = new Router(this._base_path);
  this._controller_loader = new ControllerLoader(this._base_path);
  this._session_store = new SessionStore();

  this.setup_http_server();
  this.setup_socket_server();
  this.start_http_server();
}

/* stop the http server
 *
 * @api public
 */
Server.prototype.stop = function() {
  Gourdian.logger.info("Stopping server serving base path: " + this._base_path + " on port: " + this._port);

  if (this._http_server) this._http_server.close();
}

/* prepare http server to listen for requests
 *
 * attaches handlers to server
 *
 * @api private
 */
Server.prototype.setup_http_server = function() {
  if (!this._router.need_http_server) {
    Gourdian.logger.info("No HTTP routes defined; HTTP server will not be started.");
    return;
  }

  var self = this;

  _.each(this._handlers, function(handler) {
    handler.init(self._router, self._base_path);
  });

  // separate static and dynamic HTTP requests; order of precedence is: 1) specific files, 2) dynamic content, 3) root file server, 4) transporter fallback
  this._http_server = http.createServer(function(request, response) {
    // only set cookie if not already set
    if (!request.headers.cookie) {
      var cookies = new Cookies(request, response)
        , key = self._session_store.create();

      cookies.set("_id", key, {httpOnly: true});

    } else var key = request.headers.cookie;

    var client_session = self._session_store.get(key);

    var request_body = "";
    request.on("data", function(chunk) { request_body += chunk });

    request.on("end", function() {
      var action_route = self._router.lookup_action_route(request.url);

      // find a handler that processes the request and hand off responsibility
      for (var i = 0, l = self._handlers.length; i < l; i++) {
        var handler = self._handlers[i];
        if (handler.handles(request)) {
          handler.handle(request, response);
          return;
        }
      }

      // routes for dynamically generated content
      if (action_route) {
        Gourdian.logger.info("Serving action: " + action_route.controller + "." + action_route.action);
        self._controller_loader.run(action_route, client_session, request_body, response);

      // transporter fallback - if transporter fails to find the module, sends a 404 as well
      } else {
        var lib_path = path.join(Gourdian.ROOT, "lib")
        var transporter = new Transporter({ paths: [lib_path]});

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

/* @api private */
Server.prototype.setup_socket_server = function() {
  if (!this._router.need_socket_server) {
    Gourdian.logger.info("No socket routes defined; Socket.IO will not be started");
    return;
  }

  var self = this
    , socket_routes = this._router.sockets
    , socket_route_events = socket_routes.events ? _.keys(socket_routes.events) : [];

  // set up server
  if (this._http_server === undefined) this._http_server = http.createServer();

  this._io = io.listen(this._http_server, { "log level": 0 });

  // store cookie identifier
  this._io.configure(function (){
    self._io.set("authorization", function (handshakeData, callback) {
      handshakeData.cookie_id = handshakeData.headers.cookie;
      callback(null, true);
    });
  });

  this._io.server.on("close", function() {
    Gourdian.logger.info("Socket.IO server closed");
  });

  // respond to connections
  this._io.sockets.on("connection", function(socket) {
    Gourdian.logger.info("Socket connected (" + socket.id + ")");

    // get reference to session
    var session = self._session_store.get(socket.handshake.cookie_id);

    // bind socket event routes
    for (var i = 0, l = socket_route_events.length; i < l; i++) {
      var key = socket_route_events[i];
      socket.on(key, (function() {
        var k = key;
        return function(data) {
          var result = self._controller_loader.get(socket_routes.events[k], session, "", socket, data, self._io.sockets.sockets)();
          if (result && typeof result === 'string') socket.send(result);
        };
      })());
    }

    if (socket_routes.message) socket.on("message", function(msg) {
      var result = self._controller_loader.get(socket_routes.message, session, "", socket, msg, self._io.sockets.sockets)();
      if (result && typeof result === 'string') socket.send(result);
    });

    socket.on("disconnect", function() {
      Gourdian.logger.info("Socket disconnected (" + socket.id + ")");
    });
  });
}

/* @api private */
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
};
