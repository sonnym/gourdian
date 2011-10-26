assert = require("assert");

  /////////////////
 // constructor //
/////////////////
exports = module.exports = Test;
function Test() {
  this._message = null;
  this._error = null;
  this._parallel = false;
  this._done = false;
  this._start = new Date();
  this._timeout = null;

  // prevent prototype methods from this object being called as tests
  this._exclude_from_tests = [];
  for (var fn_name in this) if (!_.include(this._exclude_from_tests, fn_name)) this._exclude_from_tests.push(fn_name);
}

  ///////////////////////
 // public properties //
///////////////////////
Test.prototype.start = function() {
  this._parallel = true;

  var self = this;
  return { "finish": function() { self._done = true }
         , "message": function(m) { self._message = m }
         };
};

Test.prototype.__defineGetter__("start_date", function() { return this._start });

Test.prototype.__defineGetter__("names", function() { return _.difference(_.keys(this), this._exclude_from_tests) });

Test.prototype.__defineGetter__("running", function() { return this._parallel && !this._done });

Test.prototype.__defineGetter__("error", function() { return this._error });
Test.prototype.__defineGetter__("message", function() { return this._message });

Test.prototype.__defineGetter__("timeout", function() { return this._timeout });
Test.prototype.__defineGetter__("bound", function() { return false });

Test.prototype.spawner = function(program, argv, callbacks) {
  var child = spawn(program, argv);

  if (callbacks["stdout"]) child.stdout.on("data", callbacks["stdout"]);
  if (callbacks["stderr"]) child.stderr.on("data", callbacks["stderr"]);
  if (callbacks["exit"]) child.on("exit", callbacks["exit"]);

  return child;
}
