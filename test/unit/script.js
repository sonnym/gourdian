var exec = require("child_process").exec;
var Gourdian = require("./../../lib/gourdian");

exports.server_script_runs_and_gets_to_repl_without_stderr_and_stops = function(test) {
  var script_dir = path.join(Gourdian.ROOT, "script");
  var stdout  = "";
  var server = spawn("./script/server.js");

  server.stdout.on("data", function(data) {
    stdout += data.toString();
    if (stdout.length >= 6) {
      test.ok(stdout.indexOf("gourd>") >= 0);
      server.stdin.write("stop();\n");
    }
  });

  server.on("exit", function(code, signal) {
    test.equal(signal, "SIGHUP");
    test.done();
  });
}
