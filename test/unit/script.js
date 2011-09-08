var ScriptTest = function() {
  Test.call(this);

  var script_dir = path.join(Gourdian.ROOT, "script");

  this.script_path_exists = function() {
    var async = this.start();

    path.exists(script_dir, function(exists) {
      assert.ok(exists);
      async.finish();
    });
  }

  this.server_script_runs_and_gets_to_repl_without_stderr = function() {
    var async = this.start()
      , data = "";

    this.spawner("./script/server.js", [],
      { "stdout": function(datum) {
          data += datum;
          if (data.length >= 6) {
            assert.equal(data.substring(0, 6), "gourd>");
            async.finish();
          }
        }
      , "stderr": function(datum) {
          async.message("received stderr: " + datum);
        }
      }
    );
  }
}

inherits(ScriptTest, Test);
module.exports = ScriptTest;
