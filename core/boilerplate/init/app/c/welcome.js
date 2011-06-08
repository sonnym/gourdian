util.inherits(module, Controller);

var Welcome = module.exports = function() {
  return {
    index: function() {
      return "Welcome to the Gourdian project!<br>The file you are looking at was created dynamically.";
    }
  , streaming: function() {
      var test = dust.compile(require("fs").readFileSync(require("path").join(Gourdian.ROOT, "app", "v", "welcome", "streaming.dust.html"), "utf8"), "template_name");
      dust.loadSource(test);

      return dust.stream("template_name", { version: process.version });
    }
  };
};
