/* dependencies */
var Cookies = require("cookies")
  , io = require("socket.io")

/* constructor */
module.exports = Server = function(logfile, port) {
  if (logfile) Gourdian.logger.location = logfile;

  Gourdian.logger.separator();

  this._port = port ? port : 8124
  this._configuration = new Configuration();

  this._http_server = null;
  this._io = null;
  this._http_server_bound_to_port = false;

  // default handlers in the order they operate
  this._action_handler = new ActionHandler();
  this._handlers = [new StaticHandler(), this._action_handler, new TransporterHandler(), new NotFoundHandler()];

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
  Gourdian.logger.info("Starting server on port " + this._port + " serving: " + this._configuration.base_path);

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
  Gourdian.logger.info("Stopping server serving base path: " + this._configuration.base_path + " on port: " + this._port);

  if (this._http_server) this._http_server.close();
}

/* prepare http server to listen for requests
 *
 * attaches handlers to server
 *
 * @api private
 */
Server.prototype.setup_http_server = function() {
  // initialize handlers
  _.each(this._handlers, function(handler) {
    handler.init();
  });

  var self = this;

  // create http server
  this._http_server = http.createServer(function(request, response) {
    // only set cookie if not already set
    if (!request.headers.cookie) {
      var cookies = new Cookies(request, response)
        , key = self._session_store.create();

      cookies.set("_id", key, {httpOnly: true});

    } else var key = request.headers.cookie;

    // load session
    var client_session = self._session_store.get(key);

    // store request body
    var request_body = "";
    request.on("data", function(chunk) { request_body += chunk });

    // at end of request, find a handler request and hand off responsibility
    request.on("end", function() {
      for (var i = 0, l = self._handlers.length; i < l; i++) {
        var handler = self._handlers[i];
        if (handler.handles(request)) {
          handler.handle(request, response, request_body, client_session);
          return;
        }
      }
    });
  });
}

/* @api private */
Server.prototype.setup_socket_server = function() {
  var self = this;

  this._io = io.listen(this._http_server, { "log level": 0 });

  // store cookie identifier
  this._io.configure(function () {
    self._io.set("authorization", function (handshakeData, callback) {
      handshakeData.cookie_id = handshakeData.headers.cookie;
      callback(null, true);
    });
  });

  this._action_handler.listen(this._io.sockets, this._session_store);

  this._io.server.on("close", function() {
    Gourdian.logger.info("Socket.IO server closed");
  });
}

/* @api private */
Server.prototype.start_http_server = function() {
  if (!this._http_server) return;

  this._http_server.on("request", function(request, response) {
    Gourdian.logger.info("HTTP request: " + JSON.stringify(request.url));
  });

  var self = this;
  this._http_server.listen(this._port, function() {
    Gourdian.logger.info("HTTP server successfully bound to port: " + self._port);

    self._http_server_bound_to_port = true;
  });
};
