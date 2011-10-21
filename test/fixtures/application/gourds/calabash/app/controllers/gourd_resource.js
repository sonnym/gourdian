module.exports = GourdResourceController = function() {
  Controller.call(this);

  this.index = function() {
    return "hello";
  };

  this.with_template = function() {
    return { magic: "be here!" };
  };
}
inherits(GourdResourceController, Controller);
