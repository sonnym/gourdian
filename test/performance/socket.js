var ext = require("../../lib/ext");

var Gourdian = require("./../../lib/gourdian");
var Configuration = require("./../../lib/configuration");

var config = new Configuration();
config.base_path = path.join(Gourdian.ROOT, "test", "fixtures", "application");
config.rebuild_paths();

var PerformanceTest = require("./../../lib/tests/performance");

exports.setUp = function(callback) {
  this.performance = new PerformanceTest();
  this.performance.start_server();
  callback();
}

exports.tearDown = function (callback) {
  this.performance.stop_server();
  callback();
}

exports.server_can_handle_200_sockets = function(test) {
  var self = this;
  ext.Sync.wait_for_while(function() { return self.performance._clients.length === 200 }, function() {
    // ensure that each client has at least 5 heartbeats after the handshake
    var ekg = function() {
      return _.reduce(self.performance._clients, function(memo, client) { return (client.heartbeats > 5) }, true);
    };
    ext.Sync.wait_for(ekg, function() { test.done() });
  }, function() {
    self.performance.add_client("ws_connect")
  });
}
