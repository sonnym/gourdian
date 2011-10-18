/* constructor */
module.exports = Config = function(base_path) {
  var config_path = path.join(base_path, "config", "config.json");

  if (path.existsSync(config_path)) {
    this._config = JSON.parse(fs.readFileSync(config_path, "utf8"));
  }

  // import all includes
  if (this._config && this._config.includes && this._config.includes.length > 0) {
    for (var i = 0, l = this._config.includes.length; i < l; i++) {
      var include = this._config.includes[i];
      global[include] = require(include);
    }
  }
}

Config.prototype.get_includes = function() {
  return (this._config && this._config.includes) ? this._config.includes : [];
}
