module.exports = NestedResourceController = function() {
  Controller.call(this);

  this.action = function() {
    return "irrelevant";
  }
}
inherits(NestedResourceController, Test);
