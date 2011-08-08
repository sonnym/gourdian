var exclude_from_tests = [];

var UnitTest = function() {
  Test.call(this);

  // prevent prototype methods from this object being called as tests
  for (var fn_name in this) exclude_from_tests.push(fn_name);
};

inherits(UnitTest, Test);

UnitTest.prototype.run_tests = function(only_name) {
  for (var test_name in this) {
    if (!Gourdian._.include(exclude_from_tests, test_name)) {
      if (only_name && test_name != only_name) continue;

      try {
        this[test_name]();
        this.pass();
      } catch(e) {
        this.register_error_or_failure(test_name, e);
      }
    }
  }
};

module.exports = UnitTest;
