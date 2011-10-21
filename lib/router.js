/* constructor */
module.exports = Router = function() {
  var configuration = new Configuration();
  this._routes = null;

  var self = this;
  configuration.operate_on_paths(["config", "routes.json"], function(error, filename) {
    Logger.info("Loading router configuration from: " + filename);

    try {
      var loaded_routes = JSON.parse(fs.readFileSync(filename, "utf8"));

      if (self._routes) {
        if (self._routes.http) {
          self._routes.http = _.union(self._routes.http, loaded_routes.http);
        } else {
          self._routes.http = loaded_routes.http;
        }

        if (self._routes.socket && self._routes.socket.events && loaded_routes.socket) {
          _.extend(self._routes.socket.events, loaded_routes.socket.events);
        } else {
          self._routes.socket = loaded_routes.socket;
        }

      } else {
        self._routes = loaded_routes;
      }
    } catch (e) {
      Logger.fatal("FATAL: Parsing router configuration failed with error: " + e.message);
    }
  });
}

Router.prototype.__defineSetter__("routes", function(val) {
  this._routes = val
});

Router.prototype.__defineGetter__("need_http_server", function() { return this._routes && this._routes.http && this._routes.http.length > 0 });
Router.prototype.__defineGetter__("need_socket_server", function() { return this._routes && this._routes.socket && _.keys(this._routes.socket).length > 0 });

Router.prototype.__defineGetter__("root", function() {
  if (!this._routes) return;

  var root_route = _.detect(this._routes.http, function(route) { if (route.root) return route; });
  return root_route;
});
Router.prototype.__defineGetter__("sockets", function() { return this._routes.socket });

Router.prototype.lookup_action_route = function(request_url) {
  if (!this._routes) return;

  var action_routes = _.select(this._routes.http, function(route) { return route.controller && route.action });
  return _.detect(action_routes, function(route) { return url.parse(request_url).pathname === route.path });
}
