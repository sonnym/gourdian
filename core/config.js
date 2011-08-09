var config;

var Config = function() {
  var config_path = path.join(Gourdian.ROOT, "config", "config.json");

  if (path.existsSync(config_path)) {
    this.config = JSON.parse(fs.readFileSync(config_path, "utf8"));
  }

  // import all includes
  if (this.config && this.config.includes && this.config.includes.length > 0) {
    for (var i = 0, l = this.config.includes.length; i < l; i++) {
      var include = this.config.includes[i];
      global[include] = require(include);
    }
  }
}

module.exports = Config;

Config.prototype.get_includes = function() {
  return (this.config && this.config.includes) ? this.config.includes : [];
}
