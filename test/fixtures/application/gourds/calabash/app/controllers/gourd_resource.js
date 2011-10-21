module.exports = GourdResourceController = function() {
  Controller.call(this);

  this.index = function() {
    return "hello";
  };
}
inherits(GourdResourceController, Controller);
