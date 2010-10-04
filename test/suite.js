// was uninspired by the offerings
(function() {
  var fs = require("fs")
    , path = require("path")
    , spawn = require("child_process").spawn
    , sys = require("sys");

  // test server needs to run from src directory
  var assertion_dirs = ["unit"]
    , run_dirs = ["performance"]

    , error = function() { sys.print("\x1B[1;37mE\x1B[0m") }
    , pass = function() { sys.print("\x1B[1;32mP\x1B[0m") }
    , fail = function() { sys.print("\x1B[1;31mF\x1B[0m") }

    , messages = [];

  for (var d = 0, l_d = assertion_dirs.length; d < l_d; d++) {
    var dir = assertion_dirs[d];

    fs.readdir(dir, function(err, files) {
      if (!files) continue;

      for (var f = 0, l_f = files.length; f < l_f; f++) {
        var file = files[f];
        if (file.substring(file.length - 2) != "js") continue;

        var test_file = require("." + path.join("/", dir, file)) // path.join(".", dir, file) does not work as expected
        for (var test_name in test_file) {
          try {
            test_file[test_name]();
            pass();
          } catch(e) {
            if (e.name && e.name == "AssertionError") {
              messages.push(test_name + " failed; " + e.expected + " " + e.operator + " " + e.actual);
              fail();
            } else {
              messages.push(test_name + " error; " + e.message);
              error();
            }
            messages[messages.length - 1] += "\n" + e.stack;
          }
        }
      }

      if (messages.length > 0) console.log("\n\n" + messages.join("\n\n"));
    });
  }
})();
