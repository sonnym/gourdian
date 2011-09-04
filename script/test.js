#!/usr/bin/env node

require("gourdian");
Gourdian.logger.location = path.join(Gourdian.ROOT, "log", "test.log");

// was uninspired by the offerings
var tests_path = path.join(Gourdian.ROOT, "test")
  , running_framework_tests = false

  , tests = []
  , messages = []
  , counts = { e: 0, f: 0, p: 0 };

process.on("uncaughtException", function(err) {
  console.log("\nCaught exception: " + err + "\n" + err.stack);
});

// handle options
var opts = new GetOpt();
opts.add("gourdian", "Run framework tests", "", "g", GetOpt.NO_ARGUMENT);

opts.add("name", "Run only the tests with a specified name", "", "n", "name", GetOpt.REQUIRED_ARGUMENT);
opts.add("file", "Run only the tests in a specified file", "", "f", "file", GetOpt.REQUIRED_ARGUMENT);

opts.add("unit-only", "Run only unit tests", false, "u", "unit", GetOpt.NO_ARGUMENT);
opts.add("integration-only", "Run only integration tests", false, "i", "integration", GetOpt.NO_ARGUMENT);

opts.add("list-only", "Do not run the tests, only list them.", "", "l", "list-only", GetOpt.NO_ARGUMENT);

try {
  opts.parse(process.argv);
} catch (e) {
  console.log(e + "\nGourdian test script usage: \n\n" + opts.help());
  return;
}

// determine if running framework tests
if (opts.get("gourdian")) {
  running_framework_tests = true;
  tests_path = path.join(Gourdian.framework_root, "test")
}

// unit tests
if (!opts.get("integration-only")) {
  console.log("----\nRunning unit tests\n----");
  decide_run_test("unit");
}

// integration tests
if (!opts.get("unit-only")) {
  console.log("\n----\nRunning integration tests\n----");
  decide_run_test("integration");
}

observe();

  /////////////////////
 // private methods //
/////////////////////
function check_directory_existence(dir) {
  var exists = path.existsSync(dir);
  if (!exists) console.log(" - Directory " + Gourdian._.last(dir.split("/")) + " does not exist");

  return exists;
}

function decide_run_test(relative_dir) {
  var dir = path.join(tests_path, relative_dir);
  if (!check_directory_existence(dir)) return;

  var files = fs.readdirSync(dir)
    , restrict_file = opts.get("file")
    , only_file = restrict_file ? path.join(tests_path, opts.get("file")) : ""
    , only_name = opts.get("name");

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

    if (required_test_file instanceof Function) {
      // instantate an instance of the test object
      var test_instance = new required_test_file();

      // list the contents of the test class
      if (opts.get("list-only")) {
        console.log("--\n" + test_file + "\n" + Gourdian._.keys(test_instance).join("\n"));
        continue;
      }

      // run tests, specifying the base path for framework integration tests if necessary
      if (running_framework_tests && relative_dir == "integration") {
        test_instance.run_tests(only_name, path.join(Gourdian.framework_root, "test", "fixtures", "application"));
      } else {
        test_instance.run_tests(only_name);
      }

      // store instance for later reference
      tests.push(test_instance);
    } else {
      console.log("Warning: " + test_file + " does not expose a constructor.");
    }
  }
}

function observe() {
  var all_tests_dead = !Gourdian._.reduce(tests, function(memo, test) { return memo || test.alive }, false);

  if (all_tests_dead) {
    // collect results
    for(var i in tests) {
      var test_instance = tests[i]
        , instance_counts = test_instance.counts;

      messages = messages.concat(test_instance.messages);

      counts.e += instance_counts.e
      counts.f += instance_counts.f
      counts.p += instance_counts.p
    }

    // print results
    if (!opts.get("list-only")) {
      console.log("----\nFailures: " + counts.f + "; Errors: " + counts.e + "; Pass: " + counts.p + "\n----");
      if (messages.length === 0) console.log("No Messages");
      else console.log("Messages\n----\n" + messages.join("\n--\n"));
    }

    process.kill(process.pid);
  } else setTimeout(function() { observe.call(this) }, null);
}
