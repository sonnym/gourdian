/* constructor */
module.exports = Router = function() {
  var configuration = new Configuration();
  this._base_path = configuration.base_path;

  var self = this;
  configuration.operate_on_paths(["config", "routes.json"], function(error, filename) {
    Logger.info("Loading router configuration from: " + filename);

    try {
      self._routes = JSON.parse(fs.readFileSync(filename, "utf8"));
    } catch (e) {
      Logger.fatal("FATAL: Parsing router configuration failed with error: " + e.message);
    }

    self.update_routes();
  });
}

Router.prototype.__defineSetter__("routes", function(val) {
  this._routes = val
  this.update_routes();
});

Router.prototype.__defineGetter__("need_http_server", function() { return this._routes && this._routes.http && this._routes.http.length > 0 });
Router.prototype.__defineGetter__("need_socket_server", function() { return this._routes && this._routes.socket && _.keys(this._routes.socket).length > 0 });

Router.prototype.__defineGetter__("root", function() { return this.root_route });
Router.prototype.__defineGetter__("sockets", function() {
  return this._routes.socket;
});

Router.prototype.lookup_action_route = function(request_url) {
  return _.detect(this.action_routes, function(route) { return url.parse(request_url).pathname === route.path });
}

Router.prototype.update_routes = function() {
  if (this._routes && this._routes.http) {
    this.root_route = _.detect(this._routes.http, function(route) { if (route.root) return route; });
    this.action_routes = _.select(this._routes.http, function(route) { return route.controller && route.action });
  } else {
    this.root_route = null;
    this.action_routes = [];
  }
}
