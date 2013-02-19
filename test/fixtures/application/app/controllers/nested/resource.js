var NestedResourceController = module.exports = function() {
  Gourdian.Controller.call(this);

  this.action = function() {
    return "irrelevant";
  }
}
inherits(NestedResourceController, Gourdian.Controller);
