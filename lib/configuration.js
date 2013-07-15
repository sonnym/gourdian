var fs = require("fs");
var path = require("path");

var _ = require("underscore");

var Configuration = module.exports = {};

var _paths = [];
var _base_path = process.cwd();

/* @param {String} str
 * @api public
 */
Configuration.__defineSetter__("base_path", function(str) { _base_path = str });

/* @return {String} base_path
 * @api public
 */
Configuration.__defineGetter__("base_path", function() { return _base_path });

/* @return {Array} paths
 * @api public
 */
Configuration.__defineGetter__("paths", function() { return _paths });


/* rebuild the paths array
 *
 * @api public
 */
Configuration.rebuild_paths = function() {
 _paths = [];

  var app_dir = path.join(_base_path);
  if (fs.existsSync(app_dir) && fs.statSync(app_dir).isDirectory()) {
    _paths.push(app_dir);
  }

  // add paths for child gourds
  var gourd_path = path.join(_base_path, "gourds");
  if (fs.existsSync(gourd_path)) {
    var files = fs.readdirSync(gourd_path);

    for (var i = 0, l = files.length; i < l; i++) {
      var filename = path.join(gourd_path, files[i])
        , stat = fs.statSync(filename);

      if (stat.isDirectory()) _paths.push(filename);
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
Configuration.operate_on_paths = function(lookup, callback) {
  for (var i = 0, i_l = _paths.length; i < i_l; i++) {
    var base_path = _paths[i]
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

/* loads all files in the configuration directory
 *
 * @api private
 */
Configuration.load_files = function() {
  var config_path = path.join(Gourdian.ROOT, "config");

  if (!fs.existsSync(config_path)) return;

  var config_files = fs.readdirSync(config_path);

  config_files.forEach(function(config_file) {
    if (path.extname(config_file) === ".json") {
      Configuration[path.basename(config_file, ".json")] = require(path.join(config_path, config_file));
    }
  });
}

Gourdian.ext.Sync.wait_for(function() { return module.loaded }, function() {
  Configuration.rebuild_paths();
  Configuration.load_files();
});;
