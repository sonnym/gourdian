#! /usr/bin/env node

process.on("uncaughtException", function(error) {
  process.stdout.write("Caught exception: " + error + "\n" + error.stack);
});

var fs = require("fs");
var path = require("path");
var _ = require("underscore");

var GetOpt = require("v8cgi/lib/getopt.js").GetOpt

var command = process.argv[2];

var lib_path = require("path").join(require.resolve("gourdian"), "..");
var ext_console = require(path.join(lib_path, "ext", "console.js"));
var ext_file = require(path.join(lib_path, "ext", "file.js"));

// main
if (command === "init") {
  // determine the target directory based on whether or not a third argument is present
  var target = cwd = process.cwd();
  if (process.argv[3]) target = path.join(cwd, process.argv[3]);

  console.log("---\nInitializing a new project in " + target);

  // ensure the target is empty but exists
  if (!fs.existsSync(target)) {
    fs.mkdir(target, 0777, function() {
      init_new_app(false);
    });
  } else if (fs.readdirSync(target).length === 0) {
    init_new_app();
  } else {
    console.log("Error: Target directory is not empty");

    // allow the user to initialize an existing project directory
    ext_console.prompt("\nDo you want to continue anyway (WARNING: some files may be overwritten)", ["y", "n"], "n", function(response) {
      if (response === "y") init_new_app(true);
    });
  }
} else if (command === "server") {
  var Gourdian = require("gourdian");
  global.stop = function() { process.kill(process.pid, "SIGHUP") };

    /////////////
   // options //
  /////////////
  var opts = new GetOpt();
  opts.add("logfile", "Set the location of the log file", "", "l", "logfile", GetOpt.REQUIRED_ARGUMENT);
  opts.add("port", "Port HTTP server and Socket.IO will listen on", "", "p", "port", GetOpt.REQUIRED_ARGUMENT);

  try {
    opts.parse(process.argv);
  } catch (e) {
    console.log(e + "\nGourdian server script usage: \n\n" + opts.help());
    return;
  }

  var logfile = (opts.get("logfile")) ? opts.get("logfile") : null
    , port = (opts.get("port")) ? opts.get("port") : null;

  // global exception handling
  process.on("uncaughtException", function(error) {
    process.stdout.write("Caught exception: " + error + "\n" + error.stack);
  });

  var server = new Gourdian.Server(logfile, port);
  server.start();

  require("repl").start("gourd> ");
} else {
  console.log("Usage: gourdian init [directory]");
  console.log("       gourdian server");
}

  /////////////
 // private //
/////////////
function init_new_app(overwrite_existing_files) {
  create_directory_structure();

  console.log("---\nCopying files\n---");

  var framework_root = require("path").join(require.resolve("gourdian"), "..", "..");
  ext_file.r_cp(path.join(framework_root, "boilerplate", "init"), target, overwrite_existing_files, function() {
    console.log("---\nCopied files successfully");
    mark_scripts_executable();
  });
}

function create_directory_structure() {
  console.log("---\nCreating directories. . . \n---");

  var directory_structure = [ { "app": ["models", "views", "controllers"] }
                            , "config"
                            , "log"
                            , { "public": ["css", "js"] }
                            , { "test": ["acceptance", "fixtures", "integration", "lib", "performance", "unit"] }
                            ];
  var directories = ext_file.reduce_directory_structure(target, directory_structure);

  _.each(directories, function(directory) {
    if (fs.existsSync(directory)) {
      console.log(directory + " present");
    } else {
      fs.mkdirSync(directory, 0755);
      console.log(directory + " created");
    }
  });
}
