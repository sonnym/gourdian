var SessionsController = module.exports = function() {
  Gourdian.Controller.call(this);

  var self = this;
  this.save = function() {
    self._session.hello = "world";
    return "";
  };

  this.check = function() {
    return self._session.hello;
  }
}
inherits(SessionsController, Gourdian.Controller);
