#! /usr/bin/env node

process.on("uncaughtException", function(error) {
  process.stdout.write("Caught exception: " + error + "\n" + error.stack);
});

var fs = require("fs");
var path = require("path");
var _ = require("underscore");

var program = require("commander");
program.version("0.0.1")

program
  .command("init [path]")
  .description("Initialize a new gourdian project")
  .action(init);

program
  .command("server")
  .description("Start a server for a gourdian project")
  .option("-l --logfile", "Set the location of the log file")
  .option("-p --port", "Port HTTP server and Socket.IO will listen on")
  .action(server);

program
  .command("*")
  .hidden()
  .action(function () { program.help() });

program.parse(process.argv);

function init(project_path) {
  var lib_path = path.join(__dirname, "..", "lib");
  var ext_console = require(path.join(lib_path, "ext", "console.js"));
  var ext_file = require(path.join(lib_path, "ext", "file.js"));

  // determine the target directory based on whether or not a third argument is present
  var target = cwd = process.cwd();
  if (project_path) {
    target = path.join(cwd, project_path);
  }

  console.log("---\nInitializing a new project in " + target);

  // ensure the target is empty but exists
  if (!fs.existsSync(target)) {
    fs.mkdir(target, 0777, function() {
      init_new_app(false, target);
    });
  } else if (fs.readdirSync(target).length === 0) {
    init_new_app(false, target);
  } else {
    console.log("Error: Target directory is not empty");

    // allow the user to initialize an existing project directory
    ext_console.prompt("\nDo you want to continue anyway (WARNING: some files may be overwritten)", ["y", "n"], "n", function(response) {
      if (response === "y") init_new_app(true, target);
    });
  }
}

function server() {
  var Gourdian = require("gourdian");

  var server = new Gourdian.Server(program.logfile, program.port);
  server.start();

  var repl = require("repl").start("gourd> ");
  repl.on("exit", function() {
    server.stop(function() {
      process.exit(0);
    });
  });
}

function init_new_app(overwrite_existing_files, target) {
  create_directory_structure(target);

  console.log("---\nCopying files\n---");

  var framework_root = require("path").join(require.resolve("gourdian"), "..", "..");
  ext_file.r_cp(path.join(framework_root, "boilerplate", "init"), target, overwrite_existing_files, function() {
    console.log("---\nCopied files successfully");
  });
}

function create_directory_structure(target) {
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
