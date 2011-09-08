var ScriptTest = function() {
  IntegrationTest.call(this);

  this.server_script_runs_and_gets_to_repl_without_stderr = function() {
    this._timeout = 500;
    var async = this.start()
      , data = "";

    exec("./script/server.js", function(error, stdout, stderr) {
      if ("stderr") async.message("received stderr: \n" + stderr);
      assert.equal(stdout.substring(0, 6), "gourd>");
    });
  }
}
inherits(ScriptTest, IntegrationTest);
module.exports = ScriptTest;
