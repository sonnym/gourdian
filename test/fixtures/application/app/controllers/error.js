module.exports = ErrorController = function() {
  Controller.call(this);

  this.index = function() {
    throw new Error("test error");
  };
};
inherits(ErrorController, Controller);
