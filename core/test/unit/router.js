var RouterTest = function() {
  UnitTest.call(this);

  this.the_truth = function() {
    assert.ok(false);
  };
}

inherits(RouterTest, UnitTest);
module.exports = RouterTest;
