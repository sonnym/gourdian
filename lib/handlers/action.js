var _ = require("underscore");

/* constructor */
var ActionHandler = module.exports = function() {
  Gourdian.IHandler.call(this);

  this._router = new Gourdian.Router();
  this._controller_loader = new Gourdian.ControllerLoader();
}
inherits(ActionHandler, Gourdian.IHandler);

/* implementation of IHandler.init
 *
 * @api public
 */
ActionHandler.prototype.init = function() { };

/* implementation of IHandler.handles
 *
 * @api public
 */
ActionHandler.prototype.handles = function(request) {
  return this._router.lookup_action_route(request.url);
};

/* implementation of IHandler.handle
 *
 * @api public
 */
ActionHandler.prototype.handle = function(request, response, session) {
  var action_route = this._router.lookup_action_route(request.url);
  Gourdian.Logger.info("Serving action: " + action_route.controller + "." + action_route.action);

  this._controller_loader.run(action_route, session, request, response);
};

/* listen for and handle socket connections
 *
 * attaches all events from router to the socket
 *
 * @param {Object} sockets from socket.io, emits connection
 * @param {SessionStore} session_store
 * @api public
 */
ActionHandler.prototype.listen = function(sockets, session_store) {
  var self = this
    , socket_routes = this._router.sockets
    , socket_route_events = socket_routes.events ? _.keys(socket_routes.events) : [];

  sockets.on("connection", function(socket) {
    Gourdian.Logger.info("Socket connected (" + socket.id + ")");

    // get reference to session
    var session = session_store.get(socket.handshake.cookie_id);

    // bind socket event routes
    for (var i = 0, l = socket_route_events.length; i < l; i++) {
      var key = socket_route_events[i];
      socket.on(key, (function() {
        var k = key;
        return function(data) {
          var result = self._controller_loader.get({ route: socket_routes.events[k]
                                                   , session: session
                                                   , socket: socket
                                                   , message: data
                                                   , sockets: sockets.sockets
                                                   })();
          if (result && typeof result === 'string') socket.send(result);
        };
      })());
    }

    // message route
    if (socket_routes.message) socket.on("message", function(msg) {
      var result = self._controller_loader.get({ route: socket_routes.message
                                               , session:  session
                                               , socket: socket
                                               , message: msg
                                               , sockets: sockets.sockets
                                               })();
      if (result && typeof result === 'string') socket.send(result);
    });

    socket.on("disconnect", function() {
      Gourdian.Logger.info("Socket disconnected (" + socket.id + ")");
    });
  });
};
