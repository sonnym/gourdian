var FileConveniences = function() { }

module.exports = FileConveniences;

module.exports.copy_files_into_directories = function(origin, destination) {
  FileConveniences.directory_descent_wrapper(origin, function(source) {
    var source_rel = source.substring(Gourdian.ROOT.length + 1)
      , source_rel_array = Gourdian._.rest((source_rel.split("/") || source.split("\\")), 3)
      , destination = path.join(Gourdian.ROOT, Gourdian._.reduce(source_rel_array, function(memo, path_part) { return path.join(memo, path_part) }));

    if (path.existsSync(destination)) {
      console.log(destination + " present");
    } else {
      fs.readFile(source, function(read_err, buf) {
        if (read_err) console.log("\nERROR:  Unable to read file " + source);

        fs.writeFile(destination, buf, function(write_err) {
          if (write_err) console.log("\nERROR: Unable to write file " + destination + " " + write_err);
          else console.log(destination + " created");
        });
      });
    }
  });
}

module.exports.directory_descent_wrapper = function(root_path, callback) {
  var files = fs.readdirSync(root_path);

  Gourdian._.each(files, function(file) {
    var abs_path = path.join(root_path, file);

    stats = fs.statSync(abs_path);
    if (stats.isDirectory()) FileConveniences.directory_descent_wrapper(abs_path, callback);

    callback(abs_path);
  });
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

