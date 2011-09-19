module.exports = SocketController = function() {
  Controller.call(this);

  this.connect = function() {
  };

  this.respond_to_socket = function() {
    return "noumenon";
  };

  this.disconnect = function() {
  };
}
inherits(SocketController, Controller);
