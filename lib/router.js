var Router = function(base_path) {
  this.base_path = base_path;
  var router_config_path = path.join(this.base_path, "config", "routes.json");

  if (path.existsSync(router_config_path)) {
    this._routes = JSON.parse(fs.readFileSync(router_config_path, "utf8"));
  } else {
    Gourdian.logger.error("Warning: Router configuration does not exist where expected (" + router_config_path + ")");
  }

  this.update_routes();
}

module.exports = Router;

Router.prototype.__defineSetter__("routes", function(val) {
  this._routes = val
  this.update_routes();
});

Router.prototype.__defineGetter__("need_http_server", function() { return this._routes && this._routes.http && this._routes.http.length > 0 });
Router.prototype.__defineGetter__("need_socket_server", function() { return this._routes && this._routes.socket && this._routes.socket.length > 0 });

Router.prototype.__defineGetter__("root", function() { return this.root_route });
Router.prototype.__defineGetter__("files", function() { return this.file_routes });

Router.prototype.in_root = function(request_url) {
  return this.root_route && path.existsSync(path.join(this.root_route.root, url.parse(request_url).pathname));
}

Router.prototype.lookup_file_route = function(request_url) {
  var pathname = url.parse(request_url).pathname;
  for (var k in this.file_routes) {
    var route = this.file_routes[k];
    if (pathname === route.path) return route;
  }
}

Router.prototype.lookup_action_route = function(request_url) {
  return Gourdian._.detect(this.action_routes, function(route) { return url.parse(request_url).pathname === route.path });
}

Router.prototype.update_routes = function() {
  if (this._routes && this._routes.http) {
    this.root_route = Gourdian._.detect(this._routes.http, function(route) { if (route.root) return route; });
    this.file_routes = Gourdian._.select(this._routes.http, function(route) { return route.file });
    this.action_routes = Gourdian._.select(this._routes.http, function(route) { return route.controller && route.action });
  } else {
    this.root_route = null;
    this.file_routes = this.action_routes = [];
  }
}
