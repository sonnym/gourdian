global.Gourdian = exports = module.exports = Gourdian = function() { };

require("./globals");

  ///////////////
 // constants //
///////////////
exports.ROOT = process.cwd();
exports.framework_root = require("path").join(__dirname, "..");

  /////////////
 // modules //
/////////////
exports.logger = require("./logger");
exports._ = require("underscore");

  ///////////////
 // functions //
///////////////
exports.shallow_inspect = function(o) { return require("util").inspect(o, false, 1) };
exports.deep_inspect = function(o) { return require("util").inspect(o, true, null) };
