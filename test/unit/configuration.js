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
}
inherits(ConfigurationTest, Test);
