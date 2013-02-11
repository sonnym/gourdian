var _ = require("underscore");
var ext = require("./ext");

/* constructor
 *
 * @return {Object} instance of ClassLoader
 * @api public
 */
module.exports = function() {
  if (!_class_loader) _class_loader = new ClassLoader();
  return _class_loader;
}

/* singleton ClassLoader object
 *
 * @api private
 */
var _class_loader = null;

/* constructor
 *
 * @api private
 */
var ClassLoader = function() { };

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
ClassLoader.prototype.load = function(dir, cb, opts) {
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
  ext.File.directory_descent_wrapper(dir, function(abs_path) {
    var stats = fs.statSync(abs_path);
    if (!stats || !stats.isFile()) return;

    if (path.extname(abs_path) !== ".js") {
      Logger.error("Warning: Class files must have an extension of .js (omitting: " + abs_path + ")");
      return;
    }

    var rel_path = abs_path.substring(dir.length, abs_path.length)
      , class_name = self.resolve_class_name(rel_path, prefix_parts)
      , required_file = require(abs_path);

    if (opts.pollute) global[class_name] = required_file;
    /*
      if (global[class_name] !== undefined) {
        Logger.error("Warning: naming conflict (omitting:" + class_name + ")");
        return;
      }
    */
    if (cb) cb(class_name, required_file);

    Logger.info("File: " + abs_path + " loaded as " + class_name);
  });
}

/* derive the name of a class based on its location
 *
 * @param {String} rel_path
 * @param {Array} prefix
 * @return {String} full name of class
 * @api private
 */
ClassLoader.prototype.resolve_class_name = function(rel_path, prefix) {
  var path_parts = rel_path.split("/")
    , filename = path_parts.pop()
    , filename_wo_ext = filename.substring(0, filename.length - 3)

    , path_prefix = []
    , path_suffix = [];

  function process_part(part) {
    // already singular, part of the prefix
    if (part === ext.Inflect.singularize(part)) {
      path_prefix.push(part);

    // already plural, part of the suffix
    } else if (part === ext.Inflect.pluralize(part)) {
      path_suffix.push(ext.Inflect.singularize(part));
    }
  }

  // determine suffix and prefix based on pluralization of each part
  if (prefix) _.each(prefix, process_part);
  _.each(path_parts, process_part);

  return ext.Inflect.classify([path_prefix.join("_"), filename_wo_ext, path_suffix.join("_")].join("_"));
}
