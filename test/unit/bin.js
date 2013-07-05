var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;

var Gourdian = require("./../../lib/gourdian");

exports.can_initialize_an_empty_project_in_a_nonexistent_directory = function(test) {
  var gourdian = spawn("gourdian", ["init", path.join("test", "fixtures", "empty_nex")]);
  gourdian.on("exit", function(code, signal) {
    test.equal(code, 0);
    test.equal(signal, null);

    exec("rm -rf " + path.join("test", "fixtures", "empty_nex"), function (err, _, stderr) {
      if (!err && !stderr) {
        test.done();
      }
    });
  });
}

exports.can_initialize_an_empty_project_in_an_existing_directory = function(test) {
  var stdout = "";
  var existing_directory_path = path.join("test", "fixtures", "empty_ex");

  fs.mkdir(existing_directory_path, 0777, function(err) {
    var gourdian = exec("yes | gourdian init " + existing_directory_path);

    gourdian.on("close", function(code, signal) {
      test.equal(code, 0);
      test.equal(signal, null);

      exec("rm -rf " + existing_directory_path, function (err, _, stderr) {
        if (!err && !stderr) {
          test.done();
        }
      });
    });
  });
}

exports.can_start_and_start_server = function(test) {
  var stdout  = "";
  var server = spawn("gourdian", ["server"]);

  server.stdout.on("data", function(data) {
    stdout += data.toString();
    if (stdout.length >= 6) {
      test.ok(stdout.indexOf("gourd>") >= 0);
      server.stdin.write(".exit\n");
    }
  });

  server.on("exit", function(code, signal) {
    test.equal(signal, null);
    test.equal(code, 0);
    test.done();
  });
}
