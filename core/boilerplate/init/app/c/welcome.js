require("util").inherits(module, require("./../../core/controller.js"));
var Welcome = module.exports = function() {
  return {
    index: function() {
      return "Welcome to the Gourdian project!<br>The file you are looking at was created dynamically.";
    }
  };
};
