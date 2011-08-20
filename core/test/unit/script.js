var ScriptTest = function() {
  Test.call(this);

  var script_dir = path.join(Gourdian.ROOT, "script");

  this.script_path_exists = function() {
    var finish = this.start();

    path.exists(script_dir, function(exists) {
      assert.ok(exists);
      finish();
    });
  }

  this.all_scripts_run_without_production_stderr = function() {
    var tracker = this.start(true);

    fs.readdir(script_dir, function(err, files) {
      Gourdian._.each(files, function(file) {
        tracker.increment();

        var child = require("child_process").spawn(path.join(script_dir, file));
        assert.ok(child);

        // one of them isn't editing, but the observer is stopping short . . .
        child.on("exit", function(code, signal) {
          assert.notEqual(code, null);
          tracker.decrement();
        });
      });
    });
  }
}

inherits(ScriptTest, Test);
module.exports = ScriptTest;
