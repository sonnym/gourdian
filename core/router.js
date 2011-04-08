Router = module.exports = function() {
  this.routes = require("./../config/routes")();

  return {
    routes: this.routes
  }
}
