/* constructor */
module.exports = TestRunner = function() {
  this._max_running = 3;

  // settings
  this._framework = false;
  this._default_timeout = 500;
  this._filters = {};

  // state
  this._counts = {e: 0, f: 0, p:0, t:0};
  this._messages = [];
  this._polling = false;
  this._tests = {};
  this._running = {};
}

/* @return {Number} count of pending tests */
TestRunner.prototype.__defineGetter__("pending", function() {
  var iterator = function(memo, test_file) { return memo += test_file.test_names.length };
  return Gourdian._.reduce(this._tests, iterator, 0);
});

/* @return {Number} count of running tests */
TestRunner.prototype.__defineGetter__("running", function() {
  var outstanding_tests = 0;
  for (var i in this._running) outstanding_tests += Gourdian._.keys(this._running[i]).length
  return outstanding_tests;
});

/* @return {Boolean} if run has completed */
TestRunner.prototype.__defineGetter__("complete", function() {
  return this.pending === 0 && this.running === 0
});

/* @return {Object} count of pass, fail, and error */
TestRunner.prototype.__defineGetter__("counts", function() { return this._counts });

/* @return {Array} messages reported by or returned from tests */
TestRunner.prototype.__defineGetter__("messages", function() { return this._messages });

/* @param {Boolean} v if running framework tests */
TestRunner.prototype.__defineSetter__("framework", function(v) { this._framework = v });

/* @param {Number} v default timeout in milliseconds */
TestRunner.prototype.__defineSetter__("timeout", function(v) { this._default_timeout = parseInt(v) });

/* set test filters
 *
 * @param {String} k in set ["file", "name"]
 * @param {String} v filter value
 */
TestRunner.prototype.filter = function(k, v) {
  if (k !== "file" && k !== "name") throw "invalid filter";
  this._filters[k] = v;
}

/* add a test file to the queue
 *
 * requires the test, creates an instance, and extracts the test names
 *
 * @api public
 */
TestRunner.prototype.add = function(filename) {
  // only run js files and limit to tests with given name if specified
  if (path.extname(filename) !== ".js") return;

  // filename filter
  if (this._filters.file && !(path.existsSync(this._filters.file) &&
      fs.realpathSync(this._filters.file) === fs.realpathSync(test_file))) return;

  // require and resolve test names from file
  this._tests[filename] = { klass: require(filename) };
  this._tests[filename].test_names = (new this._tests[filename].klass()).names;
}

/* list tests in queue
 *
 * @api public
 */
TestRunner.prototype.list = function() {
  var filenames = Gourdian._.keys(this._tests);
  for (var t in filenames) {
    var filename = filenames[t];
    console.log(filename + ":\n - " + this._tests[filename].test_names.join("\n - "));
    console.log();
  }
}

/* runs all tests in all specified files
 *
 * @api public
 */
TestRunner.prototype.run = function() {
  var base_path = this._framework ? path.join(Gourdian.framework_root, "test", "fixtures", "application") : Gourdian.ROOT;

  while (this.running <= this._max_running && this.pending > 0) {
    var test_file = Gourdian._.keys(this._tests)[0]
      , test_name = this._tests[test_file].test_names.pop();


    if (!this._filters.name || test_name === this._filters.name) {
      var test_instance = new this._tests[test_file].klass();

      // remove file from queue if last test since it is instantiated
      if (this._tests[test_file].test_names.length === 0) delete this._tests[test_file];

      if (test_instance.start_server) test_instance.start_server(base_path);
      try {
        this._counts.t++;
        test_instance[test_name]();

        if (!this._running[test_file]) this._running[test_file] = {};
        this._running[test_file][test_name] = test_instance;

        /* alternative method using vm module,
         * but does not provide better stacktraces or context isolation

        var vm = require("vm")
          , test_context = { instance: test_instance }
          , test_script = vm.createScript("var test = instance[\"" + test_name + "\"]();");

        test_script.runInNewContext(test_context);

        this._running[test_file][test_name] = test_context.instance;
        */

        // wait for test to finish
        this.observe(test_file, test_name);
      } catch(e) {
        this.register_error_or_failure(test_file, test_name, e);
      }
    }
  }
}

/* observe a test to determine if complete
 *
 * @param {String} test_file
 * @param {String} test_name
 * @api private
 */
TestRunner.prototype.observe = function(test_file, test_name) {
  var test_instance = this._running[test_file][test_name];
  if (test_instance === undefined) {
    this._counts.e++;
    process.stdout.write("\x1B[1;37me\x1B[0m")
    Gourdian.logger.error("Warning: " + test_file + " - " + test_name + " disappeared.");
    return;
  }

  var timeout = test_instance.timeout ? test_instance.timeout : this._default_timeout;

  // async operations finished
  if (!test_instance.parallel && test_instance.counter === 0) {
    this._counts.p++;
    process.stdout.write("\x1B[1;32mp\x1B[0m");

  // manual error reporting
  } else if (test_instance.error) {
    this.register_error_or_failure(test_file, test_name, test_instance.error);

  // timeout
  } else if (test_instance.start_date && (new Date() - test_instance.start_date) > timeout) {
    this._counts.e++;
    process.stdout.write("\x1B[1;37me\x1B[0m")
    this._messages.push(test_file + " - " + test_name + " error; Timed Out.");

  // iterate
  } else {
    var self = this;
    process.nextTick(function() { self.observe(test_file, test_name) });
    return;
  }

  // common functionality for any endcase but not iteration
  this.rm_test_and_run(test_file, test_name);
}

/* print result and store message if any
 *
 * @param {String} test_file
 * @param {String} test_name
 * @api private
 */
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
}

/* remove instance from running test array
 *
 * @param {String} test_file
 * @param {String} test_name
 * @api private
 */
TestRunner.prototype.rm_test_and_run = function(test_file, test_name) {
  var test_instance = this._running[test_file][test_name];
  if (test_instance === undefined) {
    this._counts.e++;
    process.stdout.write("\x1B[1;37me\x1B[0m")
    Gourdian.logger.error("Warning: " + test_file + " - " + test_name + " disappeared.");
    return;
  }

  if (test_instance.message) this._messages.push(test_file + " - " + test_name + " said; " + test_instance.message);
  if (test_instance.start_server) test_instance.stop_server();

  delete this._running[test_file][test_name];

  var remaining_test_names = Gourdian._.union(this._tests[test_file], this._running[test_file]).length;
  if (remaining_test_names === 0) delete this._running[test_file];

  this.run();
}
