var path = require("path");
var util = require("util");

global.Gourdian = exports;
global.inherits = util.inherits;

exports.ROOT = process.cwd();
exports.framework_root = require("path").join(__dirname, "..");

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

var class_loader = new Gourdian.ClassLoader();
class_loader.load(path.join(__dirname, "loaders"), null, { pollute: false, attach: Gourdian, prefix: 1});

exports.IHandler = require("./ihandler");
class_loader.load(path.join(__dirname, "handlers"), null, { pollute: false, attach: Gourdian, prefix: 1});

// user space classes
exports.Model = require("./model");
exports.Controller = require("./controller");

class_loader.load(path.join(process.cwd(), "app", "models"), null, { pollute: true });

exports.shallow_inspect = function(obj) {
  return util.inspect(o, false, 1);
}

exports.deep_inspect = function(obj) {
  return util.inspect(obj, true, null);
}
