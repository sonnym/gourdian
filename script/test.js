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
  if (test_runner) test_runner._messages.push(err.stack);
  Gourdian.logger.fatal("Caught exception: " + err + "\n" + err.stack);
});

// handle options
var opts = new GetOpt();
opts.add("gourdian", "Run framework tests", "", "g", "framework", GetOpt.NO_ARGUMENT);

opts.add("name", "Run only the tests with a specified name", "", "n", "name", GetOpt.REQUIRED_ARGUMENT);
opts.add("file", "Run only the tests in a specified file", "", "f", "file", GetOpt.REQUIRED_ARGUMENT);

opts.add("unit", "Run only unit tests", false, "u", "unit", GetOpt.NO_ARGUMENT);
opts.add("integration", "Run only integration tests", false, "i", "integration", GetOpt.NO_ARGUMENT);
opts.add("performance", "Run only performance tests", false, "p", "performance", GetOpt.NO_ARGUMENT);
opts.add("acceptance", "Run only acceptance tests", false, "a", "acceptance", GetOpt.NO_ARGUMENT);

opts.add("list-only", "Do not run the tests, only list them.", "", "l", "list-only", GetOpt.NO_ARGUMENT);

try {
  opts.parse(process.argv);
} catch (e) {
  console.log(e + "\nGourdian test script usage: \n\n" + opts.help());
  return;
}

ext.Console.separator();

// determine if running framework tests
if (opts.get("gourdian")) {
  running_framework_tests = true;
  tests_path = path.join(Gourdian.framework_root, "test")
}

// set up test runner
// attach filters if necessary
if (opts.get("file")) test_runner.filter("file", opts.get("file"));
if (opts.get("name")) test_runner.filter("name", opts.get("name"));

// add tests
if (opts.get("unit")) enqueue_test_file("unit");
if (opts.get("integration")) enqueue_test_file("integration");
if (opts.get("performance")) enqueue_test_file("performance");
if (opts.get("acceptance")) enqueue_test_file("acceptance");

// operate on tests
if (opts.get("list-only")) {
  console.log("Listing Tests");
  ext.Console.separator();
  test_runner.list();
} else {
  if (running_framework_tests) test_runner.server_path = path.join(Gourdian.framework_root, "test", "fixtures", "application");

  console.log("Running Tests");
  ext.Console.separator();
  test_runner.run();
  ext.Sync.wait_for(function() { return test_runner.complete }, print_test_output);
}

  /////////////////////
 // private methods //
/////////////////////
function enqueue_test_file(relative_dir) {
  // setup path
  var dir = path.join(tests_path, relative_dir);

  if (!path.existsSync(dir)) {
    console.log(" - Directory " + Gourdian._.last(dir.split("/")) + " does not exist");
    return;
  }

  ext.File.directory_descent_wrapper(dir, function(path) {
    var stats = fs.statSync(path);
    if (stats.isFile()) test_runner.add(path);
  });
}

function print_test_output() {
  var messages = test_runner.messages, counts = test_runner.counts;

  console.log();
  ext.Console.separator();
  console.log("Tests: " + counts.t + "; Failures: " + counts.f + "; Errors: " + counts.e + "; Pass: " + counts.p);
  ext.Console.separator();

  if (messages.length === 0) console.log("No Messages");
  else {
    ext.Console.separator();
    console.log("Messages");
    ext.Console.separator();
    console.log(messages.join("\n--\n"));
  }
}
