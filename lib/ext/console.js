var Console = function() { }
module.exports = Console;

module.exports.prompt = function(message, options, lacuna, callback) {
  if (!callback) return;

  var self = this;
  self.data = "";

  process.stdout.write(message + " (" + options.join("/") + ") [" + lacuna + "]: ");

  (function wait_for_newline() {
    if (self.data.indexOf("\n") > -1) {
      process.stdin.pause();
      if (self.data === "\n") callback(lacuna);
      else callback(self.data.replace("\n", ""));
    }
    else setTimeout(function() { wait_for_newline.call(this) }, 10)
  })();

  process.stdin.resume();
  process.stdin.on("data", function(d) { self.data += d; });
};
