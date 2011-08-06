var RouterTest = function() {
  UnitTest.call(this);

  this.the_truth = function() {
    console.log(Gourdian.shallow_inspect(this));
    assert.ok(false);
  }
}

inherits(RouterTest, UnitTest);
module.exports = RouterTest;
