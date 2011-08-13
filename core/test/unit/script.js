var ScriptTest = function() {
  Test.call(this);

  var script_dir = path.join(Gourdian.ROOT, "script");

  this.script_path_exists = function() {
    var finish = start(this);

    path.exists(script_dir, function(exists) {
      assert.ok(exists);
      finish();
    });
  }

  /*
  this.all_scripts_run_without_production_stderr = function() {
    chain
      ( [ [fs, "readdir", script_dir]
        , [spawn_files, last]
        ]
      , function(err, res) {
        console.log("all done: " + Gourdian.deep_inspect(err) + "\n" + Gourdian.deep_inspect(res))
      });

    fs.readdir(script_dir, function(err, files) {
      assert.ok(!err);

    });
  }
  */
}

/*
function spawn_files(files) {
  for (var i in files) {
    spawn(path.join(this.script_dir, files[i])).on("exit", function(code, signal) {
      assert.equal(code, 0, "script: " + files[i]);
    });
  }
}
    */

inherits(ScriptTest, Test);
module.exports = ScriptTest;
