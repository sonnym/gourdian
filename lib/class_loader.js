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
 * @api public
 */
ClassLoader.prototype.load = function(dir) {
  ext.File.directory_descent_wrapper(dir, function(abs_path) {
    fs.stat(abs_path, function(stats) {
      if (!stats.isFile()) return;

      if (path.extname(abs_path) !== ".js") {
        Gourdian.logger.error("Warning: Class files must have an extension of .js (omitting: " + abs_path + ")");
        return;
      }

      var rel_path = abs_path.substring(dir.length, abs_path.length);
    });
  });
}

/* derive the name of a class based on its location
 *
 * @param {String} rel_path
 * @return {String} full name of class
 * @api private
 */
ClassLoader.prototype.resolve_class_name = function(rel_path) {
  var path_parts = rel_path.split("/")
    , filename = path_parts.pop()
    , filename_wo_ext = filename.substring(0, filename.length - 3)

    , path_prefix = []
    , path_suffix = [];

  // determine suffix and prefix based on pluralization of each part
  _.each(path_parts, function(part) {
    // already singular, part of the prefix
    if (part === ext.Inflect.singularize(part)) {
      path_prefix.push(part);

    // already plural, part of the suffix
    } else if (part === ext.Inflect.pluralize(part)) {
      path_suffix.push(ext.Inflect.singularize(part));
    }
  });

  return ext.Inflect.classify([path_prefix.join("_"), filename_wo_ext, path_suffix.join("_")].join("_"));
}
