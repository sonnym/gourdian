assert = require("assert");

var messages, counts;

var Test = function(use_color) {
  // set up print methods
  this.error = function() { counts.e++; process.stdout.write("\x1B[1;37mE\x1B[0m") }
  this.pass = function() { counts.p++; process.stdout.write("\x1B[1;32mP\x1B[0m") }
  this.fail = function() { counts.f++; process.stdout.write("\x1B[1;31mF\x1B[0m") };

  messages = [];
  counts = {e: 0, p: 0, f: 0};
}

Test.prototype.run_tests = function() { };

Test.prototype.register_error_or_failure = function(test_name, e) {
  if (e.name && e.name == "AssertionError") {
    messages.push(test_name + " failed; expected: " + e.expected + "; actual: " + e.actual + "; operator: " + e.operator);
    this.fail();
  } else {
    messages.push(test_name + " error; " + e.message);
    this.error();
  }

  messages[messages.length - 1] += "\n" + e.stack; // append stacktrace to message
}

Test.prototype.get_messages = function() {
 return messages;
}

Test.prototype.get_counts = function() {
 return counts;
}

module.exports = Test;
