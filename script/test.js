#!/usr/bin/env node

require("gourdian");
Gourdian.logger.location = path.join(__dirname, "..", "log", "test.log");

// was uninspired by the offerings
var tests_path = path.join(Gourdian.ROOT, "test")
  , running_framework_tests = false

  , test_runner = new TestRunner()

  , tests = []
  , messages = []
  , counts = { e: 0, f: 0, p: 0 };

process.on("uncaughtException", function(err) {
  console.log("Caught exception: " + error + "\n" + error.stack);
  Gourdian.logger.fatal("Caught exception: " + error + "\n" + error.stack);
});

// handle options
var opts = new GetOpt();
opts.add("gourdian", "Run framework tests", "", "g", "framework", GetOpt.NO_ARGUMENT);

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

// run tests
console.log("---\nRunning Tests\n---");
if (!opts.get("integration-only")) decide_run_test("unit");
if (!opts.get("unit-only")) decide_run_test("integration");

// wait for complettion
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
  // setup path
  var dir = path.join(tests_path, relative_dir);
  if (!check_directory_existence(dir)) return;

  // load list of files
  var files = fs.readdirSync(dir);
  if (!files) {
    console.log("\nNo tests specified in the " + relative_dir + " directory. . .");
    return;
  }

  // attach filters if necessary
  if (opts.get("file")) test_runner.filter("file", opts.get("file"));
  if (opts.get("name")) test_runner.filter("name", opts.get("name"));

  // settings
  test_runner.list = opts.get("list-only");
  test_runner.start_framework_app = (running_framework_tests && relative_dir == "integration");

  // add files to test runner
  for (var f = 0, l_f = files.length; f < l_f; f++) {
    var test_file = path.join(dir, files[f]);
    test_runner.add(test_file);
  }
}

function observe() {
  if (test_runner.complete) {
    var messages = test_runner.messages, counts = test_runner.counts;

    // print results
    if (!opts.get("list-only")) {
      console.log("\n----\nTests: " + counts.t + "; Failures: " + counts.f + "; Errors: " + counts.e + "; Pass: " + counts.p + "\n----");
      if (messages.length === 0) console.log("No Messages");
      else console.log("Messages\n----\n" + messages.join("\n--\n"));
    }
  } else setTimeout(function() { observe.call(this) }, null);
}
