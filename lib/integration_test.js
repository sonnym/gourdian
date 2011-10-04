/* constructor */
module.exports = IntegrationTest = function() {
  this._client = null;
  this._server = null;
  this._port = 8000 + Math.floor(Math.random() * 1000);

  Test.call(this);
}
inherits(IntegrationTest, Test);

/* @returns {Boolean} is test server bound to port and accepting connections */
IntegrationTest.prototype.__defineGetter__("bound", function() {
  return this._server && this._server.bound_to_port
});

/* issue a get request to the server
 *
 * @param {String} path
 * @param {Function} callback receives response
 * @api public
 */
IntegrationTest.prototype.get = function(path, callback) {
  this._client.get(path, callback);
}

/* issue socket.io client handshake to server
 *
 * @param {Object} opts
 * @param {Function} callback
 * @api public
 */
IntegrationTest.prototype.ws_handshake = function(opts, callback) {
  this._client.ws_handshake(opts, callback);
}

/* connect socket.io client to server
 *
 * @param {Function} callback called after socket.io open event
 * @api public
 */
IntegrationTest.prototype.ws_connect = function(callback) {
  this._client.ws_connect(callback);
}

/* sends a packet to the server
 *
 * @param {Object} packet for a comprehensive list of packet types, see lib/parser.js in socket.io
 * @api public
 */
IntegrationTest.prototype.ws_send_packet = function(packet) {
  var self = this;
  ext.Sync.wait_for(function() { return self._client._connected }, function() {
    self._client._socket.packet(packet);
  });
}

/* @api private */
IntegrationTest.prototype.start_server = function(base_path) {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), this._port, base_path);
  this._server.start();

  if (this._server._io) {
    this._client = new TestClient(this);

    var self = this;
    this._server._io.configure(function() {
      self._server._io.set("heartbeat interval", .05);
      self._server._io.set("heartbeat timeout", .05);
      self._server._io.set("close timeout", 0);
    });
  }
}

/* @api private */
IntegrationTest.prototype.stop_server = function() {
  this._server.stop();
  if (this._client) this._client.end();
}
