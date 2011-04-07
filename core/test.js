#!/usr/bin/env node

// was uninspired by the offerings
var fs = require("fs")
  , path = require("path")
  , spawn = require("child_process").spawn
  , sys = require("sys")

  , getopt = require("v8cgi/lib/getopt").GetOpt

  , self = this

  , assertion_dirs = ["unit"]
  , run_dirs = ["integration"]

  , server_path = path.join(__dirname, "..", "core", "server.js")
  , log_path = path.join(__dirname, "..", "log", "test.log")
  , tests_path = path.join(__dirname, "..", "test")

  , server = spawn(server_path, ["--logfile=" + log_path])
  , server_stdout = server_stderr = ""

  , error = function() { sys.print("\x1B[1;37mE\x1B[0m") }
  , pass = function() { sys.print("\x1B[1;32mP\x1B[0m") }
  , fail = function() { sys.print("\x1B[1;31mF\x1B[0m") }

  , count_e = count_p = count_f = 0
  , messages = []

  , integration_tests_complete = final_output_printed = false;

// attempt to kill server if tests fail hard
process.on("uncaughtException", function(err) {
  // also being called when an async test fails; ignore that case
  if (e.name && e.name != "AssertionError") {
    console.log("\nCaught exception: " + err + "\n" + err.stack);
    try {
      server.kill("SIGHUP");
      console.log("\nTest server successfully sent SIGHUP.");
    } catch(e) {
      console.log(e.toString());
    };
  }
});

// handle options
var opts = new getopt();
opts.add("name", "Run only the tests with a specified name", "", "n", "name", getopt.REQUIRED_ARGUMENT);
opts.add("file", "Run only the tests in a specified file", "", "f", "file", getopt.REQUIRED_ARGUMENT);
opts.add("unit-only", "Run only unit tests", false, "u", "unit", getopt.NO_ARGUMENT);
opts.add("integration-only", "Run only integration tests", false, "i", "integration", getopt.NO_ARGUMENT);
opts.parse(process.argv);

// unit tests
if (!opts.get("integration-only")) {
  console.log("\nRunning unit tests. . .");
  for (var d = 0, l_d = assertion_dirs.length; d < l_d; d++) {
    decide_run_test(assertion_dirs[d]);
  }
}

// integration tests
if (!opts.get("unit-only")) {
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
} else integration_tests_complete = true;

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
  var dir = path.join(tests_path, relative_dir)
    , files = fs.readdirSync(dir)
    , restrict_file = opts.get("file")
    , only_file = restrict_file ? path.join(tests_path, opts.get("file")) : "";


  if (!files) {
    console.log("\nNo tests specified in the " + relative_dir + " directory. . .");
    return;
  }

  for (var f = 0, l_f = files.length; f < l_f; f++) {
    var test_file = path.join(dir, files[f]);

    // only run js files and limit to tests with given name if specified
    if (path.extname(test_file) != '.js') continue;
    if (restrict_file && !(path.existsSync(only_file) && fs.realpathSync(only_file) == fs.realpathSync(test_file))) continue;

    var required_test_file = require(test_file)
      , test_instance = required_test_file()
      , only_name = opts.get("name");

    for (var test_name in test_instance) {
      if (only_name && test_name != only_name) continue;

      try {
        test_instance[test_name]();

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