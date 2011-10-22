/* recursive copy
 *
 * @param {String} from
 * @param {String} to
 * @param {Boolean} overwrite_existing_directories
 * @param {Function} callback called with any errors and/or at completion
 * @api public
 */
module.exports.r_cp = function(from, to, overwrite_existing_files, callback) {
  var self = this
    , calls = 0;

  if (!path.existsSync(from)) return;

  module.exports.directory_descent_wrapper(from, function(source) {
    var source_rel = source.substring(from.length + 1)
      , source_rel_array = source_rel.split("/")  // waiting for path.separator or some such convenience
      , destination = path.join(to, _.reduce(source_rel_array, function(memo, path_part) { return path.join(memo, path_part) }));

    calls++;
    fs.stat(source, function(err, stat) {
      if (err) Logger.debug("Error copying file: " + source + "; " + err.message);
      else if (!stat.isDirectory()) {
        if (!overwrite_existing_files && path.existsSync(destination)) {
          console.log(destination + " present");
        } else {
          calls++;
          fs.readFile(source, function(read_err, buf) {
            fs.writeFile(destination, buf, function(write_err) {
              if (write_err) console.log("\nERROR: Unable to write file " + destination + " " + write_err);
              else console.log(destination + " created");
              calls--;
            });
          });
        }
      }
      calls--;
    });
  } , function() {
    if (callback) ext.Sync.wait_for(function() { return calls === 0 }, callback);
  });
}

/* performs an operation on every object in a directory recursively
 *
 * @param {String} root_path
 * @param {Function} process_callback passed the absolute path of the object being processed
 ** abs_path
 * @param {Function} complete_callback
 * @api public
 */
module.exports.directory_descent_wrapper = function(root_path, process_callback, complete_callback) {
  root_path = path.resolve(root_path);

  var files = fs.readdirSync(root_path);

  if (process_callback && files && files.length > 0){
    _.each(files, function(file) {
      var abs_path = path.join(root_path, file);

      stats = fs.statSync(abs_path);
      if (stats.isDirectory()) module.exports.directory_descent_wrapper(abs_path, process_callback);

      process_callback(abs_path);
    });

    if (complete_callback) complete_callback();
  }
}

/* recursively appends items from directory structure onto
 * root path
 *
 * @param {String} root_path
 * @param {Object} structure
 * @return {Array} of absolute paths
 * @api public
 */
module.exports.reduce_directory_structure = function(root_path, structure) {
  return _.flatten(_.map(structure, function(iterated_object) {
    if (typeof iterated_object === "object") {
      var key = _.keys(iterated_object)[0];
      return [ path.join(root_path, key), module.exports.reduce_directory_structure(path.join(root_path, key), _.values(iterated_object)[0]) ];

    } else if (typeof iterated_object === "string") {
      return path.join(root_path, iterated_object);
    }
  }));
}

