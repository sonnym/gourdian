var ErrorController = module.exports = function() {
  Gourdian.Controller.call(this);

  this.index = function() {
    throw new Error("test error");
  };
};
inherits(ErrorController, Gourdian.Controller);
