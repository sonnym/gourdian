module.exports = SocketTest = function() {
  PerformanceTest.call(this);

  var async = this.start();

  this.server_can_handle_125_sockets = function() {
    var self = this;
    (function wait() {
      if (self._clients.length === 125) {
        (function ekg() {
          // ensure that each client has at least 5 heartbeats after the handshake
          if (Gourdian._.reduce(self._clients, function(memo, client) { return (client.heartbeats > 5) }, true)) {
            async.finish();
          } else {
            setTimeout(ekg, null);
          }
        })();
      } else {
        self.add_client("ws_connect")
        setTimeout(wait, null);
      }
    })();
  }
}
inherits(SocketTest, PerformanceTest);
