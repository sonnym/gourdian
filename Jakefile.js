/*
namespace("lint", function () {
  desc("A task for running node-linter on gourdian");
  task("framework", [], function() {
    var linter = require("node-linter");

    linter.run({ files: path.join(__dirname, "..", "..", "core", "gourdian.js")
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
*/

namespace("test", function() {
  var path = require("path")
    , spawn = require("child_process").spawn

    , test_script = path.join(__dirname, "script", "test")
    , test = null;

  namespace("framework", function() {
    // override default test script location if running from gourdian root
    if (__dirname === path.join(require.resolve("gourdian"), "..", "..")) {
      test_script = path.join(test_script, "..", "test.js");
    }

    desc("List framework tests");
    task("list", [], function() { test = spawn(test_script, ["-g", "-l"]) }, true);

    desc("Run all framework tests");
    task("all", [], function() { test = spawn(test_script, ["-g", "-i", "-p", "-u"]) }, true);

    desc("Run framework unit tests");
    task("unit", [], function() { test = spawn(test_script, ["-g", "-u"]) }, true);

    desc("Run framework integration tests");
    task("integration", [], function() { test = spawn(test_script, ["-g", "-i"]) }, true);

    desc("Run framework performance tests");
    task("performance", [], function() { test = spawn(test_script, ["-g", "-p"]) }, true);
  });

  desc("List application tests");
  task("list", [], function() { test = spawn(test_script, ["-l"]) }, true);

  desc("Run application tests");
  task("all", [], function() { test = spawn(test_script, ["-i", "-p", "-u"]) }, true);

  desc("Run application unit tests");
  task("unit", [], function() { test = spawn(test_script, ["-u"]) }, true);

  desc("Run application integration tests");
  task("integration", [], function() { test = spawn(test_script, ["-i"]) }, true);

  desc("Run application performance tests");
  task("performance", [], function() { test = spawn(test_script, ["-p"]) }, true);

  (function wait_for_tests() {
    if (test === null) setTimeout(wait_for_tests, null);
    else {
      test.stdout.setEncoding('utf8');
      test.stderr.setEncoding('utf8');
      test.stdout.on("data", function(data) { console.log(data) });
      test.stderr.on("data", function(data) { console.log(data) });
      test.on("exit", function() { complete() });
   }
 })();
});
