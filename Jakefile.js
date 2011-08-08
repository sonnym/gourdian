desc("Initialize submodule dependencies");
task("submodules", [], function() {
  var path = require("path")
    , spawn = require("child_process").spawn;

    var gourdian = spawn(path.join(__dirname, "script", "gourdian"), ["--init-submodules"]);
    /*
    gourdian.stdout.on("data", function(data) { console.log("stdout: " + data) });
    gourdian.stderr.on("data", function(data) { console.log("stderr: " + data) });
    */
    gourdian.on("exit", function(code) { complete() });
}, true);

namespace("lint", function () {
  desc("A task for running node-linter on gourdian");
  task("framework", [], function() {
    var linter = require("node-linter");

    linter.run({ files: "./core/gourdian.js"
               , config: "./node_modules/node-linter/conf/server.json"
               , confRoot: "./node_modules/node-linter/conf"
               , recursive: true
               , format: true
               , callback: function(errors) {
                   console.log(errors);
                   complete();
                 }
               });
  }, true);

  desc("A task for running node-linter on the app directory of the project");
  task("app", [], function() {
    var linter = require("node-linter");

    linter.run({ files: "./app"
               , config: "./node_modules/node-linter/conf/server.json"
               , confRoot: "./node_modules/node-linter/conf"
               , recursive: true
               , format: true
               , callback: function(errors) {
                   console.log(errors);
                   complete();
                 }
               });
  }, true);
});

namespace("test", function() {
  namespace("framework", function() {
    desc("List framework tests");
    task("list", ["submodules"], function() {
      var path = require("path")
        , spawn = require("child_process").spawn;

      var test = spawn(path.join(__dirname, "script", "test"), ["-l", "-d", path.join(__dirname, "core", "test")]);
      test.stdout.setEncoding('utf8');
      test.stdout.on("data", function(data) { console.log(data) });
      test.stderr.setEncoding('utf8');
      test.stderr.on("data", function(data) { console.log(data) });
      test.on("exit", function() { complete() });
    }, true);

    desc("Run all framework tests");
    task("all", ["submodules"], function() {
      var path = require("path")
        , spawn = require("child_process").spawn;

      var test = spawn(path.join(__dirname, "script", "test"), ["-d", path.join(__dirname, "core", "test")]);
      test.stdout.setEncoding('utf8');
      test.stdout.on("data", function(data) { console.log(data) });
      test.stderr.setEncoding('utf8');
      test.stderr.on("data", function(data) { console.log(data) });
      test.on("exit", function() { complete() });
    }, true);

    desc("Run framework unit tests");
    task("unit", ["submodules"], function() {
      var path = require("path")
        , spawn = require("child_process").spawn;

      var test = spawn(path.join(__dirname, "script", "test"), ["-u", "-d", path.join(__dirname, "core", "test")]);
      test.stdout.setEncoding('utf8');
      test.stdout.on("data", function(data) { console.log(data) });
      test.stderr.setEncoding('utf8');
      test.stderr.on("data", function(data) { console.log(data) });
      test.on("exit", function() { complete() });
    }, true);

    desc("Run framework unit tests");
    task("integration", ["submodules"], function() {
      var path = require("path")
        , spawn = require("child_process").spawn;

      var test = spawn(path.join(__dirname, "script", "test"), ["-i", "-d", path.join(__dirname, "core", "test")]);
      test.stdout.setEncoding('utf8');
      test.stdout.on("data", function(data) { console.log(data) });
      test.stderr.setEncoding('utf8');
      test.stderr.on("data", function(data) { console.log(data) });
      test.on("exit", function() { complete() });
    }, true);
  });

  desc("Run application unit tests");
  task("all", ["submodules"], function() {
    var path = require("path")
      , spawn = require("child_process").spawn;

    var test = spawn(path.join(__dirname, "script", "test"), ["-u"]);
    test.stdout.on("data", function(data) { console.log(data) });
    test.stderr.on("data", function(data) { console.log(data) });
    test.on("exit", function() { complete() });
  }, true);

  desc("Run application integration tests");
  task("app", ["submodules"], function() {
    var path = require("path")
      , spawn = require("child_process").spawn;

    var test = spawn(path.join(__dirname, "script", "test"), ["-i"]);
    test.stdout.on("data", function(data) { console.log(data) });
    test.stderr.on("data", function(data) { console.log(data) });
    test.on("exit", function() { complete() });
  }, true);
});
