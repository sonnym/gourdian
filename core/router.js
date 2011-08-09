var routes;

var Router = function() {
  var router_config_path = path.join(Gourdian.ROOT, "config", "routes.json");

  if (path.existsSync(router_config_path)) {
    this.routes = JSON.parse(fs.readFileSync(router_config_path, "utf8"));
  }
}

module.exports = Router;

Router.prototype.get_routes = function () {
  return this.routes;
}
