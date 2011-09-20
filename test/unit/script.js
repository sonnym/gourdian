var ScriptTest = function() {
  Test.call(this);

  var script_dir = path.join(Gourdian.ROOT, "script");

  this.server_script_runs_and_gets_to_repl_without_stderr_and_stops = function() {
    this._timeout = 1000;
    var async = this.start()
      , data = ""
      , child = this.spawner("./script/server.js", [],
        { "stdout": function(datum) {
            data += datum;
            if (data.length >= 6) {
              data += ""; /* data needs to be manipulated in order for this test to work
                             presumably because it is buffer but is coerced this way */
              assert.ok(data.indexOf("gourd>") >= 0);
              child.stdin.write("stop();\n");
            }
          }
        , "stderr": function(datum) {
            async.message("received stderr: " + datum);
          }
        , "exit": function(code, signal) {
            assert.equal(signal, "SIGHUP");
            async.finish();
          }
        }
      );
  }
}

inherits(ScriptTest, Test);
module.exports = ScriptTest;
