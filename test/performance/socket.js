module.exports = SocketTest = function() {
  PerformanceTest.call(this);

  var async = this.start();

  this.server_can_handle_200_sockets = function() {
    var self = this;
    ext.Sync.wait_for_while(function() { return self._clients.length === 200 }, function() {
      // ensure that each client has at least 5 heartbeats after the handshake
      var ekg = function() {
        return _.reduce(self._clients, function(memo, client) { return (client.heartbeats > 5) }, true);
      };
      ext.Sync.wait_for(ekg, function() { async.finish() });
    }, function() {
      self.add_client("ws_connect")
    });
  }
}
inherits(SocketTest, PerformanceTest);
