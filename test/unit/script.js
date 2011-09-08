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
}

inherits(ScriptTest, Test);
module.exports = ScriptTest;
