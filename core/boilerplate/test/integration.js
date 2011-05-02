require("util").inherits(module, require("./../../core/integration_test"));
var TESTNAME = module.exports = function() {
  return {
    the_truth: function() {
      assert(true, true);
    }
  };
};
