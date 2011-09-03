assert = require("assert");

  /////////////////
 // constructor //
/////////////////
exports = module.exports = Test;
function Test() {
  // prevent prototype methods from this object being called as tests
  for (var fn_name in this) if (!Gourdian._.include(exclude_from_tests, fn_name)) exclude_from_tests.push(fn_name);
}

  ///////////////////////
 // public properties //
///////////////////////
Test.prototype.__defineGetter__("messages", function() { return messages });
Test.prototype.__defineGetter__("counts", function() { return counts });
Test.prototype.__defineGetter__("alive", function() { return Gourdian._.keys(running).length > 0 });
Test.prototype.__defineSetter__("timeout", function(t) { timeout = t });

  ////////////////////////
 // private properties //
////////////////////////
var running = {}
  , exclude_from_tests = []
  , messages = []
  , timeout = 500
  , counts = {e: 0, p: 0, f: 0};

  ////////////////////
 // public methods //
////////////////////
Test.prototype.run_tests = function(only_name) {
  for (var test_name in this) {
    if (!Gourdian._.include(exclude_from_tests, test_name)) {
      if (only_name && test_name !== only_name) continue;

      running[test_name] = { "value": null, "counter": 0, "start": new Date() };
      try {
        // add a start method to this, allowing test to access its counter
        Gourdian._.extend(this, {"start": function(with_counter) { return (function(name) {
          if (with_counter) {
            running[name].parallel = true;
            return { "increment": function(v) { running[name].counter += (v ? v : 1) }
                   , "decrement": function() {
                       running[name].counter--;
                       if (running[name].counter == 0) running[name].parallel = false;
                     }
                   };
          } else {
            running[name].counter++;
            return function() { running[name].counter = 0 }
          }
        }(test_name)) } });

        running[test_name].value = this[test_name]();
      } catch(e) {
        register_error_or_failure(test_name, e);
      } finally {
        observe(test_name);
      }
    }
  }
};

  /////////////////////
 // private methods //
/////////////////////
var observe = function(test_name) {
  var test = running[test_name];

  if (!test) {
    console.log(" - Error: " + test_name + " disappeared.");
    process.stdout.write("\x1B[1;37me\x1B[0m")
    delete running[test_name];

  } else if (test.value === undefined && !test.parallel && test.counter == 0) {
    counts.p++;
    process.stdout.write("\x1B[1;32mp\x1B[0m");
    delete running[test_name];

  } else if (test.start && (new Date() - test.start) > timeout) {
    counts.e++;
    process.stdout.write("\x1B[1;37me\x1B[0m")
    messages.push(test_name + " error; Timed Out.");
    delete running[test_name];

  } else setTimeout(observe, null, test_name);
}

var register_error_or_failure = function(test_name, e) {
  if (e.name && e.name == "AssertionError") {
    messages.push(test_name + " failed; expected: " + e.expected + "; actual: " + e.actual + "; operator: " + e.operator);
    counts.f++;
    process.stdout.write("\x1B[1;31mf\x1B[0m")
  } else {
    messages.push(test_name + " error; " + e.message);
    counts.e++;
    process.stdout.write("\x1B[1;37me\x1B[0m")
  }

  messages[messages.length - 1] += "\n" + e.stack; // append stacktrace to message
}
