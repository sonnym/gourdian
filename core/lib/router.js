var routes, file_routes, dynamic_routes;

var Router = function(base_path) {
  var router_config_path = path.join(base_path, "config", "routes.json");

  if (path.existsSync(router_config_path)) {
    this.route_obj = JSON.parse(fs.readFileSync(router_config_path, "utf8"));
  }

  this.file_routes = Gourdian._.select(this.route_obj && this.route_obj.http, function(route) { return route.file });
  this.action_routes = Gourdian._.select(this.route_obj && this.route_obj.http, function(route) { return route.controller && route.action });
}

module.exports = Router;

Router.prototype.__defineSetter__("routes", function(val) { this.route_obj = val });

Router.prototype.__defineGetter__("need_http_server", function() { return this.route_obj && this.route_obj.http && this.route_obj.http.length > 0 });
Router.prototype.__defineGetter__("need_socket_server", function() { return this.route_obj && this.route_obj.socket && this.route_obj.socket.length > 0 });

Router.prototype.__defineGetter__("root", function() {
  var route = Gourdian._.detect(this.route_obj && this.route_obj.http && this.route_obj.http, function(route) { return route.root });
  return route ? route.root : null;
});

Router.prototype.__defineGetter__("file_route", function() { return Gourdian._.detect(this.file_routes, function(route) { return url.parse(request.url).pathname === route.path }) });

Router.prototype.lookup_action_route = function(request_url) {
  return Gourdian._.detect(this.action_routes, function(route) { return url.parse(request_url).pathname === route.path });
}
