var SocketController = module.exports = function() {
  Gourdian.Controller.call(this);

  var self = this;

  this.connect = function() {
  };

  this.respond_to_socket = function() {
    return "noumenon";
  };

  this.check_session = function() {
    return self._session.hello;
  }

  this.echo = function() {
    return this._message.secret;
  }

  this.disconnect = function() {
  };
}
inherits(SocketController, Gourdian.Controller);
