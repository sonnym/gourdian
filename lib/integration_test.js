module.exports = IntegrationTest = function() {
  this._client = null;
  this._server = null;
  this._port = 8000 + Math.floor(Math.random() * 1000);

  Test.call(this);
}
inherits(IntegrationTest, Test);

IntegrationTest.prototype.start_server = function(base_path) {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), this._port, base_path);
  this._server.start();

  if (this._server._io) {
    this._client = new TestClient(this._port);

    var self = this;
    this._server._io.configure(function() {
      self._server._io.set("heartbeat interval", .05);
      self._server._io.set("heartbeat timeout", .05);
      self._server._io.set("close timeout", 0);
    });
  }
}

IntegrationTest.prototype.__defineGetter__("bound", function() { return this._server && this._server.bound_to_port });

IntegrationTest.prototype.get = function(path, callback) {
  this._client.get(path, callback, this);
}

IntegrationTest.prototype.ws_connect = function(callback) {
  this._client.ws_connect(callback, this);
}

IntegrationTest.prototype.stop_server = function() {
  this._server.stop();
  if (this._client) this._client.end();
}
