var ServerTest = function() {
  UnitTest.call(this);

  this.the_truth = function() {
    assert.ok(false);
  };
}

inherits(ServerTest, UnitTest);
module.exports = ServerTest;
