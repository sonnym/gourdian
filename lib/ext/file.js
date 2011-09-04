var FileConveniences = function() { }

module.exports = FileConveniences;

// recurses into subdirectories
module.exports.copy_files_into_directory = function(origin, destination, callback) {
  var self = this
  self.calls = 0;

  if (!path.existsSync(origin)) return;

  FileConveniences.directory_descent_wrapper(origin, function(source) {
    var source_rel = source.substring(origin.length + 1)
      , source_rel_array = source_rel.split("/")  // waiting for path.separator or some such convenience
      , destination = path.join(destination, Gourdian._.reduce(source_rel_array, function(memo, path_part) { return path.join(memo, path_part) }));

    if (path.existsSync(destination)) {
      self.calls++;
      fs.stat(destination, function(err, stat) {
        if (!err && !stat.isDirectory) console.log(destination + " present");
        self.calls--;
      });
    } else {
      self.calls++;
      fs.readFile(source, function(read_err, buf) {
        fs.writeFile(destination, buf, function(write_err) {
          if (write_err) console.log("\nERROR: Unable to write file " + destination + " " + write_err);
          else console.log(destination + " created");
          self.calls--;
        });
      });
    }
  } , function() {
    (function wait() {
      if (callback && self.calls === 0) callback();
      else setTimeout(function() { wait.call(this) }, 1);
    })();
  });
}

module.exports.directory_descent_wrapper = function(root_path, process_callback, complete_callback) {
  var files = fs.readdirSync(root_path);

  if (process_callback && files && files.length > 0){
    Gourdian._.each(files, function(file) {
      var abs_path = path.join(root_path, file);

      stats = fs.statSync(abs_path);
      if (stats.isDirectory()) FileConveniences.directory_descent_wrapper(abs_path, process_callback);

      process_callback(abs_path);
    });

    if (complete_callback) complete_callback();
  }
}

module.exports.reduce_directory_structure = function(initial_value, obj) {
  return Gourdian._.flatten(Gourdian._.map(obj, function(iterated_object) {
    if (typeof iterated_object === "object") {
      var key = Gourdian._.keys(iterated_object)[0];
      return [ path.join(initial_value, key), FileConveniences.reduce_directory_structure(path.join(initial_value, key), Gourdian._.values(iterated_object)[0]) ];

    } else if (typeof iterated_object === "string") {
      return path.join(initial_value, iterated_object);
    }
  }));
}

