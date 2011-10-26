/* constructor */
module.exports = PerformanceTest = function() {
  this._server = null;
  this._clients = [];
  this._port = 8000 + Math.floor(Math.random() * 1000);

  Test.call(this);

  // effectively removes timeout
  this._parallel = true;
  this._start = null;
}
inherits(PerformanceTest, Test);

/* @returns {Boolean} is test server bound to port and accepting connections */
PerformanceTest.prototype.__defineGetter__("bound", function() { return this._server && this._server.bound_to_port });

/*
 * @api public
 */
PerformanceTest.prototype.add_client = function(action, cb) {
  var client = new TestClient(this);
  this._clients.push(client);

  if (action) client[action](function() { if (cb) cb() });

  return client;
}

/*
 * @api private
 */
PerformanceTest.prototype.start_server = function() {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), this._port);
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

/*
 * @api private
 */
PerformanceTest.prototype.stop_server = function() {
  if (this._clients.length > 0) {
    for (var d = this._clients.length - 1; d > 0; d--) {
      this._clients[d].end();
    }
  }

  this._server.stop();
}
