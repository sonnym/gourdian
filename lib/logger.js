var fs = require("fs");
var path = require("path");

/* constructor */
var Logger = module.exports = function() { }

/* set the location of the log file
 *
 * @static
 * @api public */
Logger.__defineSetter__("location", function(str) {
  stream.end();
  stream = null;

  location = str;
});

/* @api private */
var level = 'debug'
  , levels = { "debug": 1
             , "info": 2
             , "error": 3
             , "fatal": 4
             }

  , location = path.join(Gourdian.ROOT, "log", "development.log")
  , stream = null;

/* @static
 * @api public */
Logger.debug = function(msg) { calc_and_write("debug", msg) }
Logger.info = function(msg) { calc_and_write("info", msg) }
Logger.error = function(msg) { calc_and_write("error", msg) }
Logger.fatal = function(msg) { calc_and_write("fatal", msg) }
Logger.end = function() { stream.end() };

/* @static
 * @api public */
Logger.separator = function() { output("============================="); }

/* @api private */
function calc_and_write(lvl, msg) {
  if (levels[level] && levels[level] <= levels[lvl]) output(msg);
  else output("Logger: Invalid log level specified");
}

/* @api private */
function output(msg) {
  if (!stream) {
    stream = fs.createWriteStream(location, {flags: "a", encoding: "utf8"});
    stream.on("error", function(err) {
      console.log("Logger stream error:");
      console.log(err)
    });
  }

  if (stream.writable) stream.write((new Date()).toString() + ": " + msg.toString() + "\n");
}

