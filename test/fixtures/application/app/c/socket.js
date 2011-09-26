module.exports = SocketController = function() {
  Controller.call(this);

  var self = this;

  this.connect = function() {
  };

  this.respond_to_socket = function() {
    return "noumenon";
  };

  this.check_session = function() {
    return self._session.hello;
  }

  this.disconnect = function() {
  };
}
inherits(SocketController, Controller);
