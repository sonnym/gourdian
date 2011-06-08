Config = module.exports = function() {
  this.config = require("./../config/config")();
  this.includes = {}

  // import all includes
  if (this.config.includes && this.config.includes.length > 0) {
    for (var i = 0, l = this.config.includes.length; i < l; i++) {
      var include = this.config.includes[i];
      global[include] = require(include);
    }
  }

  return {
    includes: this.includes
  }
}
