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

/* rebuild the paths array
 *
 * @api public
 */
Configuration.prototype.rebuild_paths = function() {
  var app_dir = path.join(this._base_path);
  if (path.existsSync(app_dir) && fs.statSync(app_dir).isDirectory()) {
    this._paths.push(app_dir);
  }

  /* add additional paths
  fs.readdir(this._base_path, function(err, files) {
    for (var i = 0, l = files.length; i < l; i++) {
      var stat = fs.statSync(files[i]);
      if (stat.isDir()) {
      };
    }
  });
  */
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
    var confirmed_path = [];

    // check each part of the lookup for existence before operating on it
    for (var j = 0, j_l = lookup.length; j < j_l; j++) {
      confirmed_path.push(lookup[j]);
      var test_path = path.join(this._base_path, confirmed_path.join("/"));

      if (path.existsSync(test_path) && confirmed_path.length === lookup.length) {
        callback(null, test_path);
      }
    }
  }
}
