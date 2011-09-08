assert = require("assert");

  /////////////////
 // constructor //
/////////////////
exports = module.exports = Test;
function Test() {
  this._parallel = false;
  this._counter = 0;
  this._start = new Date();

  var self = this;
  this.start = function(with_counter) {
    if (with_counter) {
      self._parallel = true;
      return { "increment": function(v) { self._counter += (v ? v : 1) }
             , "decrement": function() { self._counter--; }
             };
    } else {
      self._counter++;
      return function() { self._counter = 0 };
    }
  }

  // prevent prototype methods from this object being called as tests
  this._exclude_from_tests = [];
  for (var fn_name in this) if (!Gourdian._.include(this._exclude_from_tests, fn_name)) this._exclude_from_tests.push(fn_name);
}

  ///////////////////////
 // public properties //
///////////////////////
Test.prototype.__defineGetter__("start_date", function() { return this._start });

Test.prototype.__defineGetter__("names", function() { return Gourdian._.difference(Gourdian._.keys(this), this._exclude_from_tests) });

Test.prototype.__defineGetter__("counter", function() { return this._counter });
Test.prototype.__defineGetter__("parallel", function() { return this._parallel });
