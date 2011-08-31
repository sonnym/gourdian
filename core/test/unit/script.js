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
}

inherits(ScriptTest, Test);
module.exports = ScriptTest;
