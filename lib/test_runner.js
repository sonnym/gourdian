module.exports = TestRunner;

function TestRunner() {
  // settings
  this._list = false;
  this._start_framework_app = false;
  this._default_timeout = 250;
  this._filters = {};

  // state
  this._counts = {e: 0, f: 0, p:0, t:0};
  this._messages = [];
  this._polling = false;
  this._tests = [];
  this._running = [];
}

TestRunner.prototype.__defineGetter__("complete", function() {
  var outstanding_tests = 0;
  for (var i in this._running) outstanding_tests += Gourdian._.keys(this._running[i]).length
  return this._tests.length === 0 && outstanding_tests === 0 && this._polling === false
});
TestRunner.prototype.__defineGetter__("counts", function() { return this._counts });
TestRunner.prototype.__defineGetter__("messages", function() { return this._messages });

TestRunner.prototype.__defineSetter__("list", function(v) { this._list = v });
TestRunner.prototype.__defineSetter__("start_framework_app", function(v) { this._start_framework_app = v });
TestRunner.prototype.__defineSetter__("timeout", function(v) { this._default_timeout = parseInt(v) });

TestRunner.prototype.filter = function(k, v) {
  if (k !== "file" && k !== "name") throw "invalid filter";
  this._filters[k] = v;
}

TestRunner.prototype.add = function(filename) {
  this._tests.push(filename);

  if (!this._polling) {
    this._polling = true;
    TestRunner.prototype.poll.call(this);
  }
}

TestRunner.prototype.poll = function() {
  if (this._tests.length > 0) {
    TestRunner.prototype.run_tests.call(this);
  }

  if (this._tests.length > 0) {
    var self = this;
    setTimeout(function() { TestRunner.prototype.poll.call(self) }, null)
  } else {
    this._polling = false;
  }
}

TestRunner.prototype.run_tests = function() {
  while (this._tests.length > 0) {
    var test_file = this._tests.pop();
    this._running[test_file] = {};
    TestRunner.prototype.run.call(this, test_file);
  }
}

TestRunner.prototype.run = function(test_file) {
  // only run js files and limit to tests with given name if specified
  if (path.extname(test_file) != '.js') return;

  var base_path = this._start_framework_app ? path.join(Gourdian.framework_root, "test", "fixtures", "application") : Gourdian.ROOT;

  // filename filter
  if (this._filters.file && !(path.existsSync(this._filters.file) &&
                              fs.realpathSync(this._filters.file) === fs.realpathSync(test_file))) return;

  var required_test_file = require(test_file);
  if (required_test_file instanceof Function) {
    // instantiate one instance of the test object in order to extract its test names
    var test_instance = new required_test_file()
      , test_names = test_instance.names;

    // list the tests
    if (this._list) {
      console.log(test_file + ":\n - " + test_names.join("\n - "));
      return;
    }

    // run the tests
    for (var t in test_names) {
      var test_name = test_names[t];
      if (this._filters.name && test_name !== this._filters.name) continue;

      test_instance = new required_test_file();
      if (test_instance.start_server) test_instance.start_server(base_path);
      try {
        this._counts.t++;
        test_instance[test_name]();
        this._running[test_file][test_name] = test_instance;
      } catch(e) {
        TestRunner.prototype.register_error_or_failure.call(this, test_file, test_name, e);
      } finally {
        TestRunner.prototype.observe.call(this, test_file, test_name);
      }
    }
  } else {
    console.log("Warning: " + test_file + " does not expose a constructor.");
  }
}

TestRunner.prototype.observe = function(test_file, test_name) {
  var test_instance = this._running[test_file][test_name]
    , timeout = test_instance.timeout ? test_instance.timeout : this._default_timeout;

  if (!test_instance) {
    this._counts.e++;
    process.stdout.write("\x1B[1;37me\x1B[0m")
    Gourdian.logger.error("Warning: " + test_file + " - " + test_name + " disappeared.");

  } else if (!test_instance.parallel && test_instance.counter === 0) {
    this._counts.p++;
    process.stdout.write("\x1B[1;32mp\x1B[0m");
    TestRunner.prototype.rm_test_instance.call(this, test_file, test_name);

  } else if (test_instance.start_date && (new Date() - test_instance.start_date) > timeout) {
    this._counts.e++;
    process.stdout.write("\x1B[1;37me\x1B[0m")
    TestRunner.prototype.rm_test_instance.call(this, test_file, test_name);
    this._messages.push(test_file + " - " + test_name + " error; Timed Out.");

  } else {
    var self = this;
    setTimeout(function() { TestRunner.prototype.observe.call(self, test_file, test_name) }, null);
  }
}

TestRunner.prototype.rm_test_instance = function(test_file, test_name) {
  var test_instance = this._running[test_file][test_name];

  if (test_instance.message) this._messages.push(test_file + " - " + test_name + " said; " + test_instance.message);
  if (test_instance.start_server) test_instance.stop_server();

  delete this._running[test_file][test_name];
}

TestRunner.prototype.register_error_or_failure = function(test_file, test_name, e) {
  if (e.name && e.name == "AssertionError") {
    this._messages.push(test_file + " - " + test_name + " failed; expected: " + e.expected + "; actual: " + e.actual + "; operator: " + e.operator);
    this._counts.f++;
    process.stdout.write("\x1B[1;31mf\x1B[0m")
  } else {
    process.stdout.write("\x1B[1;37me\x1B[0m")
    this._counts.e++;
    this._messages.push(test_file + " - " + test_name + " error; " + e.message);
  }

  this._messages[this._messages.length - 1] += "\n" + e.stack; // append stacktrace to message
  if (this._running[test_file] && this._running[test_file][test_name]) delete this._running[test_file][test_name];
}
