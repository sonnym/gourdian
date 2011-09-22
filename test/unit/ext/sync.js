module.exports = SyncExtTest = function() {
  Test.call(this);

  var async = this.start();

  this.wait_for = function() {
    var condition = false;

    ext.Sync.wait_for(function() { return condition }, function() {
      assert.ok(condition);
      async.finish();
    });

    setTimeout(function() { condition = true; }, 20);
  }
}
inherits(SyncExtTest, Test);
