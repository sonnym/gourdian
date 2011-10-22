#!/usr/bin/env node

require("gourdian");
global.stop = function() { process.kill(process.pid, "SIGHUP") };

  /////////////
 // options //
/////////////
var opts = new GetOpt();
opts.add("logfile", "Set the location of the log file", "", "l", "logfile", GetOpt.REQUIRED_ARGUMENT);
opts.add("port", "Port HTTP server and Socket.IO will listen on", "", "p", "port", GetOpt.REQUIRED_ARGUMENT);

try {
  opts.parse(process.argv);
} catch (e) {
  console.log(e + "\nGourdian server script usage: \n\n" + opts.help());
  return;
}

var logfile = (opts.get("logfile")) ? opts.get("logfile") : null
  , port = (opts.get("port")) ? opts.get("port") : null;

// global exception handling
process.on("uncaughtException", function(error) {
  process.stdout.write("Caught exception: " + error + "\n" + error.stack);
});

var server = new Server(logfile, port);
server.start();

require("repl").start("gourd> ");
