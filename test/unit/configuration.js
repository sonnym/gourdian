module.exports = ConfigurationTest = function() {
  Test.call(this);

  this.is_singleton = function() {
    var c_1 = new Configuration();
    var c_2 = new Configuration();

    assert.ok(c_1 === c_2);
  }

  this.configuration_automatically_adds_gourd_paths = function() {
    var c = new Configuration();

    assert.equal(c.paths.length, 2);
  }

  this.operate_on_paths = function() {
    var c = new Configuration()
      , operated_paths = []
      , async = this.start();

    c.operate_on_paths(["."], function(error, filename) {
      operated_paths.push(filename);
    });

    ext.Sync.wait_for(function() { return c.paths.length === operated_paths.length }, function() {
      assert.equal(operated_paths.length, _.uniq(operated_paths).length);
      async.finish();
    });
  };
}
inherits(ConfigurationTest, Test);
