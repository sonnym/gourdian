#! /usr/bin/env node

require("gourdian");

var command = process.argv[2];

// main
if (command === "init") {
  // determine the target directory based on whether or not a third argument is present
  var target = cwd = process.cwd();
  if (process.argv[3]) target = path.join(cwd, process.argv[3]);

  console.log("---\nInitializing a new project in " + target);

  // ensure the target is empty but exists
  if (!path.existsSync(target)) {
    fs.mkdir(target, 0777, function() {
      init_new_app(false);
    });
  } else if (fs.readdirSync(target).length === 0) {
    init_new_app();
  } else {
    console.log("Error: Target directory is not empty");

    // allow the user to initialize an existing project directory
    ext.Console.prompt("\nDo you want to continue anyway (WARNING: some files may be overwritten)", ["y", "n"], "n", function(response) {
      if (response === "y") init_new_app(true);
    });
  }
} else {
  console.log("Usage: script/gourdian init [directory]");
}

  /////////////
 // private //
/////////////
function init_new_app(overwrite_existing_files) {
  create_directory_structure();

  console.log("---\nCopying files\n---");

  ext.File.r_cp(path.join(Gourdian.framework_root, "boilerplate", "init"), target, overwrite_existing_files, function() {
    console.log("---\nCopied files successfully");
    mark_scripts_executable();
  });
}

function create_directory_structure() {
  console.log("---\nCreating directories. . . \n---");

  var directory_structure = [ { "app": ["m", "v", "c"] }
                            , "config"
                            , "log"
                            , { "public": ["css", "js"] }
                            , "script"
                            , { "test": ["acceptance", "fixtures", "integration", "lib", "performance", "unit"] }
                            ];
  var directories = ext.File.reduce_directory_structure(target, directory_structure);

  _.each(directories, function(directory) {
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
