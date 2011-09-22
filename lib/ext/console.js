/* display a prompt on the command line
 *
 * @param {String} message
 * @param {Array} options
 * @param {String} lacuna
 * @param {Function} callback
 * @api public
 */
module.exports.prompt = function(message, options, lacuna, callback) {
  if (!callback) return;

  var self = this;
  self.data = "";

  process.stdout.write(message + " (" + options.join("/") + ") [" + lacuna + "]: ");

  ext.Sync.wait_for(function() { return (self.data.indexOf("\n") > -1) }, function() {
    process.stdin.pause();
    if (self.data === "\n") callback(lacuna);
    else callback(self.data.replace("\n", ""));
  });

  process.stdin.resume();
  process.stdin.on("data", function(d) { self.data += d; });
}

/* output a separator
 *
 * @api public
 */
module.exports.separator = function() {
  process.stdout.write("---\n");
}
