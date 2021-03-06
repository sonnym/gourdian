var fs = require("fs");
var path = require("path");

var _ = require("underscore");

/* constructor
 *
 * @api public
 */
var ClassLoader = module.exports = {};

/* load all classes in a directory recursively
 *
 * @param {String} dir base directory
 * @param {Function} cb called with reference to required file
 ** class_name
 ** class_reference
 * @param {Object} opts
 ** pollute [false] include classes in global namespace
 ** prefix [0] depth of absolute path to include in the name
 * @api public
 */
ClassLoader.load = function(dir, cb, opts) {
  if (!fs.existsSync(dir)) return;

  if (!opts) opts = {};

  var prefix_parts = [];
  if (opts.prefix && opts.prefix > 0) {
    var dir_parts = dir.split("/")
      , prefix_parts = [];

    if (opts.prefix > dir_parts.legth) throw "prefix too great"

    for (var i = 0; i < opts.prefix; i++) {
      prefix_parts.push(dir_parts.pop())
    }
  }

  var self = this;
  Gourdian.ext.File.directory_descent_wrapper(dir, function(abs_path) {
    var stats = fs.statSync(abs_path);
    if (!stats || !stats.isFile()) return;

    if (path.extname(abs_path) !== ".js") {
      Gourdian.Logger.error("Warning: Class files must have an extension of .js (omitting: " + abs_path + ")");
      return;
    }

    var rel_path = abs_path.substring(dir.length, abs_path.length)
      , class_name = self.resolve_class_name(rel_path, prefix_parts)
      , required_file = require(abs_path);

    if (opts.pollute) global[class_name] = required_file;
    else if (opts.attach) opts.attach[class_name] = required_file;
    /*
      if (global[class_name] !== undefined) {
        Gourdian.Logger.error("Warning: naming conflict (omitting:" + class_name + ")");
        return;
      }
    */
    if (cb) cb(class_name, required_file);

    Gourdian.Logger.info("File: " + abs_path + " loaded as " + class_name);
  });
}

/*  determine the path to an application dependency
 *
 *  this method allows the framework to load modules outside its normal
 *  scope by prepending the module lookup path with the application module
 *  path
 *
 *  @param {String} module_name the name of the module to resolve
 *  @return {String} full path to the module
 *  @api public
 */
ClassLoader.resolve_application_module = function(module_name) {
  module.paths.unshift(require("path").join(Gourdian.ROOT, "node_modules"));
  var module_path = require.resolve(module_name);
  module.paths.shift();
  return module_path;
}

/* derive the name of a class based on its location
 *
 * @param {String} rel_path
 * @param {Array} prefix
 * @return {String} full name of class
 * @api private
 */
ClassLoader.resolve_class_name = function(rel_path, prefix) {
  var path_parts = rel_path.split("/")
    , filename = path_parts.pop()
    , filename_wo_ext = filename.substring(0, filename.length - 3)

    , path_prefix = []
    , path_suffix = [];

  function process_part(part) {
    // already singular, part of the prefix
    if (part === Gourdian.ext.Inflect.singularize(part)) {
      path_prefix.push(part);

    // already plural, part of the suffix
    } else if (part === Gourdian.ext.Inflect.pluralize(part)) {
      path_suffix.push(Gourdian.ext.Inflect.singularize(part));
    }
  }

  // determine suffix and prefix based on pluralization of each part
  if (prefix) _.each(prefix, process_part);
  _.each(path_parts, process_part);

  return Gourdian.ext.Inflect.classify([path_prefix.join("_"), filename_wo_ext, path_suffix.join("_")].join("_"));
}
