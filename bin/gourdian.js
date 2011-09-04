#! /usr/bin/env node

require("gourdian");

// main
if (process.argv[2] == "--init") {
  // presumably, by this point, Gourdian has been properly installed
  require("gourdian");

  // determine the target directory based on whether or not a third argument is present
  var target = cwd = process.cwd();
  if (process.argv[3]) target = path.join(cwd, process.argv[3]);

  console.log("---\nInitializing a new project in " + target);

  // ensure the target is empty but exists
  if (!path.existsSync(target)) {
    fs.mkdir(target, 0666, function() {
      init_new_app();
    });
  } else if (fs.readdirSync(target).length == 0) {
    init_new_app();
  } else {
    console.log("Error: Target directory is not empty");
  }
} else {
  console.log("Usage: script/gourdian --init [relative directory]");
}

  /////////////
 // private //
/////////////
function init_new_app() {
  create_directory_structure();

  console.log("---\nCopying files\n---");

  ext.File.copy_files_into_directory(path.join(Gourdian.framework_root, "boilerplate", "init"), target, function() {
    console.log("---\nCopied files successfully");
    mark_scripts_executable();
  });
}

function create_directory_structure() {
  console.log("---\nCreating directories. . . \n---");

  var directory_structure = [{ "app": ["m", "v", "c"] }, "config", "log", { "public": ["css", "js"] }, "script", { "test": ["integration", "lib", "performance", "unit"] }]
    , directories = ext.File.reduce_directory_structure(target, directory_structure);

  Gourdian._.each(directories, function(directory) {
    if (path.existsSync(directory)) {
      console.log(directory + " present");
    } else {
      fs.mkdirSync(directory, 0755);
      console.log(directory + " created");
    }
  });
}

function mark_scripts_executable() {
  console.log("---\nMarking scripts executable\n---");
  fs.readdir(path.join(".", "script"), function(err, files) {
    for (var i in files) {
      fs.chmod(path.join(".", "script", files[i]), 0771);
    }
  });
}
