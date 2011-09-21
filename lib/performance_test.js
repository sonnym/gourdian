module.exports = PerformanceTest = function() {
  this._server = null;
  this._clients = [];
  this._port = 8000 + Math.floor(Math.random() * 1000);

  Test.call(this);

  this._start = null; // effectively removes timeout
}
inherits(PerformanceTest, Test);

PerformanceTest.prototype.start_server = function(base_path) {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), this._port, base_path);
  this._server.start();

  if (this._server._io) {
    var self = this;
    this._server._io.configure(function() {
      self._server._io.set("heartbeat interval", .05);
      self._server._io.set("heartbeat timeout", .05);
      self._server._io.set("close timeout", 0);
    });
  }
}

PerformanceTest.prototype.__defineGetter__("bound", function() { return this._server && this._server.bound_to_port });

PerformanceTest.prototype.stop_server = function() {
  if (this._clients.length > 0) {
    for (var d = this._clients.length - 1; d > 0; d--) {
      this._clients[d].end();
    }
  }

  this._server.stop();
}

PerformanceTest.prototype.add_client = function(action, cb) {
  var client = new TestClient(this._port);
  this._clients.push(client);

  client[action](function() { if (cb) cb() }, this);
}
