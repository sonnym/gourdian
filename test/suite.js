#!/usr/bin/env node

// was uninspired by the offerings
var fs = require("fs")
  , path = require("path")
  , spawn = require("child_process").spawn
  , sys = require("sys")
  , vm = require("vm")

  , getopt = require("v8cgi/lib/getopt.js").GetOpt

  , self = this

  , assertion_dirs = ["unit"]
  , run_dirs = ["integration"]

  , server_path = path.join(__dirname, "..", "src", "server.js")
  , log_path = path.join(__dirname, "..", "log", "test.log")
  , server = spawn(server_path, ["--logfile=" + log_path])
  , server_stdout = server_stderr = ""

  , error = function() { sys.print("\x1B[1;37mE\x1B[0m") }
  , pass = function() { sys.print("\x1B[1;32mP\x1B[0m") }
  , fail = function() { sys.print("\x1B[1;31mF\x1B[0m") }

  , count_e = count_p = count_f = 0
  , messages = []

  , integration_tests_complete = final_output_printed = false

  // command line arguments
  , name;

// handle options
var opts = new getopt();
opts.add("name", "Run only the tests with a specified name", "", "n", "name", getopt.REQUIRED_ARGUMENT);
opts.parse(process.argv);

// unit tests
console.log("\nRunning unit tests. . .");
for (var d = 0, l_d = assertion_dirs.length; d < l_d; d++) {
  decide_run_test(assertion_dirs[d]);
}

// integration tests
console.log("\n----\nRunning integration tests. . .\nServer started with pid: " + server.pid);
server.stderr.on('data', function (data) { server_stderr += data; });

server.stdout.on('data', function (data) {
  server_stdout += data;

  // wait for server to come up before running tests
  if (data.toString().substring(0, 5) == "bugd>") {
    for (var d = 0, l_d = run_dirs.length; d < l_d; d++) {
      decide_run_test(run_dirs[d]);
    }
    integration_tests_complete = true;
  }
});

self.stay_alive_loop = function() {
  if (integration_tests_complete && !final_output_printed) {
    if (messages.length > 0) console.log("\n" + messages.join("\n\n"));

    console.log("\n----\nPass: " + count_p + "; Error: " + count_e + "; Fail: " + count_f);
    console.log("----\nServer stderr: " + server_stderr);

    final_output_printed = true;
    //server.kill("SIGHUP");
  }

  setTimeout(function() { return self.stay_alive_loop() } , 500);
}
self.stay_alive_loop();

  /////////////
 // private //
/////////////
function decide_run_test(relative_dir) {
  var dir = path.join(__dirname, relative_dir)
    , files = fs.readdirSync(dir);

  if (!files) return;

  for (var f = 0, l_f = files.length; f < l_f; f++) {
    var file = files[f];
    if (path.extname(file) != '.js') continue;

    var test_file = require(path.join(dir, file))
      , context = test_file.context ? test_file.context : { };

    context["assert"] = require("assert");
    context["log"] = require("./../src/log");
    context.log.location = log_path;

    for (var test_name in test_file) {
      // only run the test specified by name
      var name = opts.get("name");
      if (test_name != "context" && (!name || test_name == name)) {
        try {
          var test_function = test_file[test_name].toString()
          vm.runInNewContext("var t = " + test_function + "; t();" , context, test_file);

          pass();
          count_p++;
        } catch(e) {
          if (e.name && e.name == "AssertionError") {
            messages.push(test_name + " failed; expected: " + e.expected + "; actual: " + e.actual + "; operator: " + e.operator);
            fail();
            count_f++;
          } else {
            messages.push(test_name + " error; " + e.message);
            error();
            count_e++;
          }
          messages[messages.length - 1] += "\n" + e.stack;
        }
      }
    }
  }
}
