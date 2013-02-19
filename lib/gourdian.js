global.Gourdian = exports;
global.inherits = require("util").inherits;

// extensions
exports.ext = require("./ext");

// core classes
exports.Logger = require("./logger");
exports.ClassLoader = require("./class_loader");
exports.Configuration = require("./configuration");

// server classes
exports.Server = require("./server");
exports.Router = require("./router");
exports.SessionStore = require("./session_store");

// user space classes
exports.Model = require("./model");
exports.Controller = require("./controller");

var class_loader = new Gourdian.ClassLoader();
class_loader.load(require("path").join(__dirname, "loaders"), null, { pollute: false, attach: Gourdian, prefix: 1});

exports.IHandler = require("./ihandler");
class_loader.load(require("path").join(__dirname, "handlers"), null, { pollute: false, attach: Gourdian, prefix: 1});

  ///////////////
 // constants //
///////////////
exports.ROOT = process.cwd();
exports.framework_root = require("path").join(__dirname, "..");

  ///////////////
 // functions //
///////////////
exports.shallow_inspect = function(o) { return require("util").inspect(o, false, 1) };
exports.deep_inspect = function(o) { return require("util").inspect(o, true, null) };
