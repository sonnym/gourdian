#!/usr/bin/env node

// was uninspired by the offerings
var fs = require("fs")
  , path = require("path")
  , spawn = require("child_process").spawn
  , sys = require("sys")

  , assertion_dirs = ["unit"]
  , run_dirs = ["integration"]

  , server_path = path.join(__dirname, "..", "src", "server.js")
  , server = spawn(server_path)
  , server_stdout = server_stderr = ""

  , error = function() { sys.print("\x1B[1;37mE\x1B[0m") }
  , pass = function() { sys.print("\x1B[1;32mP\x1B[0m") }
  , fail = function() { sys.print("\x1B[1;31mF\x1B[0m") }

  , count_e = count_p = count_f = 0

  , messages = []

  // command line arguments
  , name;

// getopt would be far superior
if (process.argv[2] == "-n" && process.argv.length > 3) {
  name = process.argv[3];
}

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
  }
});

var self = this
  , loops = 0;

self.stay_alive_loop = function() {
  setTimeout(function() { return self.stay_alive_loop() } , 500);

  // TODO: use vm module to run async tests, allowing for a real solution for knowing when the tests are complete
  if (loops == 2) {
    if (messages.length > 0) console.log("\n" + messages.join("\n\n"));
    console.log("\n----\nPass: " + count_p + "; Error: " + count_e + "; Fail: " + count_f);
    console.log("----\nServer stderr: " + server_stderr);
    // server.kill("SIGHUP");
  }
  loops++;
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
    if (file.substring(file.length - 2) != "js") continue;

    var test_file = require(path.join(dir, file));
    for (var test_name in test_file) {
      run_test(test_file, test_name);
    }
  }
}

function run_test(test_file, test_name) {
  if (!name || test_name == name) {
    try {
      test_file[test_name]();
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
