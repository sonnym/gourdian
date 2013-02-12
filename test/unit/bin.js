var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;

exports.can_initialize_an_empty_project_in_a_nonexistent_directory = function(test) {
  var gourdian = spawn("gourdian", ["init", path.join("test", "fixtures", "empty_nex")]);
  gourdian.on("exit", function(code, signal) {
    test.equal(code, 0);
    test.equal(signal, null);

    exec("ls " + path.join("test", "fixtures", "empty_nex", "script") + " | wc -l" , function(_, stdout, _) {
      test.equal(3, parseInt(stdout));

      exec("rm -rf " + path.join("test", "fixtures", "empty_nex"), function (err, _, stderr) {
        if (!err && !stderr) {
          test.done();
        }
      });
    });
  });
}

exports.can_initialize_an_empty_project_in_an_existing_directory = function(test) {
  var stdout = "";

  fs.mkdir(path.join("test", "fixtures", "empty_ex"), 0777, function(err) {
    var gourdian = spawn("gourdian", ["init", path.join("test", "fixtures", "empty_ex")]);

    gourdian.stdout.on("data", function(data) {
      stdout += data.toString();
      if (stdout.indexOf("[n]:")) {
        gourdian.stdin.write("y\n");
      }
    });

    gourdian.on("exit", function(code, signal) {
      test.equal(code, 0);
      test.equal(signal, null);
      exec("ls " + path.join("test", "fixtures", "empty_ex", "script") + " | wc -l" , function(_, stdout, _) {
        test.equal(3, parseInt(stdout));

        exec("rm -rf " + path.join("test", "fixtures", "empty_ex"), function (err, _, stderr) {
          if (!err && !stderr) {
            test.done();
          }
        });
      });
    });
  });
}
