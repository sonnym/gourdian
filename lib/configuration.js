var fs = require("fs");
var path = require("path");

var _ = require("underscore");

/* constructor
 *
 * @return {Object} instance of Configuration)
 * @api public
 */
module.exports = function() {
  if (!_configuration) _configuration = new Configuration();
  return _configuration;
}

/* reference to Configuration instance
 *
 * @api private
 */
var _configuration = null;

/* constructor
 *
 * @api private
 */
var Configuration = function() {
  this._paths = [];
  this._base_path = process.cwd();

  this.rebuild_paths();
}

/* @param {String} str
 * @api public
 */
Configuration.prototype.__defineSetter__("base_path", function(str) { this._base_path = str });

/* @return {String} base_path
 * @api public
 */
Configuration.prototype.__defineGetter__("base_path", function() { return this._base_path });

/* @return {Array} paths
 * @api public
 */
Configuration.prototype.__defineGetter__("paths", function() { return this._paths });


/* rebuild the paths array
 *
 * @api public
 */
Configuration.prototype.rebuild_paths = function() {
  this._paths = [];

  var app_dir = path.join(this._base_path);
  if (fs.existsSync(app_dir) && fs.statSync(app_dir).isDirectory()) {
    this._paths.push(app_dir);
  }

  // add paths for child gourds
  var gourd_path = path.join(this._base_path, "gourds");
  if (fs.existsSync(gourd_path)) {
    var files = fs.readdirSync(gourd_path);

    for (var i = 0, l = files.length; i < l; i++) {
      var filename = path.join(gourd_path, files[i])
        , stat = fs.statSync(filename);

      if (stat.isDirectory()) this._paths.push(filename);
    }
  }
}

/* search for files in paths array
 *
 * @param {Array} lookup
 * @param {Function} callback called if file is found
 ** error
 ** filename
 * @api public
 */
Configuration.prototype.operate_on_paths = function(lookup, callback) {
  for (var i = 0, i_l = this._paths.length; i < i_l; i++) {
    var base_path = this._paths[i]
      , confirmed_path = [];

    // check each part of the lookup for existence before operating on it
    for (var j = 0, j_l = lookup.length; j < j_l; j++) {
      confirmed_path.push(lookup[j]);
      var test_path = path.join(base_path, confirmed_path.join("/"));

      if (fs.existsSync(test_path) && confirmed_path.length === lookup.length) {
        callback(null, test_path);
      }
    }
  }
}
