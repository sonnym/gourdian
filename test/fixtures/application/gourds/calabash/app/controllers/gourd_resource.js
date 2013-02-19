var GourdResourceController = module.exports = function() {
  Gourdian.Controller.call(this);

  this.index = function() {
    return "hello";
  };

  this.with_template = function() {
    return { magic: "be here!" };
  };
}
inherits(GourdResourceController, Gourdian.Controller);
