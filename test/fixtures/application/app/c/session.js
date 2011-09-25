module.exports = SessionsController = function() {
  Controller.call(this);

  var self = this;
  this.save = function() {
    self._session.hello = "world";
    return "";
  };
}
inherits(SessionsController, Controller);
