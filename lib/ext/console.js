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

  process.stdout.write(message + " (" + options.join("/") + ") [" + lacuna + "]: ");
  process.stdin.resume();

  var data = "";
  process.stdin.on("data", function(d) { data += d; });

  (function wait_for() {
    if (data.indexOf("\n") > -1) {
      process.stdin.pause();

      if (data === "\n") callback(lacuna);
      else callback(data.replace("\n", ""));
    } else setImmediate(wait_for);
  })();
}

/* output a separator
 *
 * @api public
 */
module.exports.separator = function() {
  process.stdout.write("---\n");
}
