#!/usr/bin/env node

// was uninspired by the offerings
var fs = require("fs")
  , path = require("path")
  , spawn = require("child_process").spawn
  , sys = require("sys")

  , assertion_dirs = ["unit"]
  , run_dirs = ["performance"]

  , server_path = path.join(__dirname, "..", "src", "server.js")
  , server = spawn('node', [ server_path ])

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

for (var d = 0, l_d = assertion_dirs.length; d < l_d; d++) {
  var dir = path.join(__dirname, assertion_dirs[d]);

  fs.readdir(dir, function(err, files) {
    if (!files) return;

    for (var f = 0, l_f = files.length; f < l_f; f++) {
      var file = files[f];
      if (file.substring(file.length - 2) != "js") continue;

      var test_file = require(path.join(dir, file));
      for (var test_name in test_file) {
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
    }

    console.log();

    if (messages.length > 0) console.log("\n" + messages.join("\n\n"));

    console.log("\nPass: " + count_p + "; Error: " + count_e + "; Fail: " + count_f + "\n");
  });
}
