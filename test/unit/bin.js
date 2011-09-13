module.exports = BinTest = function() {
  Test.call(this)
  var async = this.start();

  this.can_initialize_an_empty_project_in_a_nonexistent_directory = function() {
    this._timeout = 1000;
    this.spawner( "gourdian", ["init", path.join("test", "fixtures", "empty_nex")]
                , { "exit": function(code, sig) {
                       assert.equal(code, 0);
                       assert.equal(sig, null);
                       exec("ls " + path.join("test", "fixtures", "empty_nex", "script") + " | wc -l" , function(err, stdout, stderr) {
                         assert.equal(4, parseInt(stdout));
                         exec("rm -rf " + path.join("test", "fixtures", "empty_nex"), function (err, stdout, stderr) {
                           if (!err && !stderr) async.finish();
                         });
                       });
                    }
                  }
                );
  }

  this.can_initialize_an_empty_project_in_an_existing_directory = function() {
    this._timeout = 1000;
    var self = this;
    fs.mkdir(path.join("test", "fixtures", "empty_ex"), 0777, function(err) {
      self.spawner( "gourdian", ["init", path.join("test", "fixtures", "empty_ex")]
                  , { "exit": function(code, sig) {
                         assert.equal(code, 0);
                         assert.equal(sig, null);
                         exec("ls " + path.join("test", "fixtures", "empty_ex", "script") + " | wc -l" , function(err, stdout, stderr) {
                           assert.equal(4, parseInt(stdout));
                           exec("rm -rf " + path.join("test", "fixtures", "empty_ex"), function (err, stdout, stderr) {
                             if (!err && !stderr) async.finish();
                           });
                         });
                      }
                    }
                  );
    });
  }
}
inherits(BinTest, Test);
