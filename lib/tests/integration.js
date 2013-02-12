var path = require("path");
var Gourdian = require("./../gourdian");
var Server = require("./../server");

var port_offset = 0;

/* constructor */
exports = module.exports = IntegrationTest = function() {
  this._client = null;

  this._clients = [];
  this._server = null;
  this._port = 47000 + (port_offset++);
}

/* @returns {Boolean} is test server bound to port and accepting connections */
IntegrationTest.prototype.__defineGetter__("bound", function() {
  return this._server && this._server.bound_to_port
});

/* add a client to the clients array
 *
 * @returns {Object} reference to client
 * @api public
 */
IntegrationTest.prototype.add_client = function() {
  var client = new TestClient(this);
  this._clients.push(client);

  return client;
}

/* issue a get request to the server
 *
 * @param {String} path
 * @param {Function} callback
 ** response
 * @api public
 */
IntegrationTest.prototype.get = function(path, callback) {
  this._client.get(path, callback);
}

/* issue a post request to the server
 *
 * @param {String} path
 * @param {Object} body
 * @param {Function} callback
 ** response
 * @api public
 */
IntegrationTest.prototype.post = function(path, body, callback) {
  this._client.post(path, body, callback);
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
  this._client.ws_send_packet(packet);
}

/* emits an event of name with data
 *
 * @param {String} name
 * @param {Object} data
 * @api public
 */
IntegrationTest.prototype.ws_emit = function(name, data) {
  this._client.ws_emit(name, data);
}

/* start the server with application at given path
 *
 * @api public */
IntegrationTest.prototype.start_server = function() {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), this._port);
  this._server.start();

  if (this._server._io) {
    this._client = new TestClient(this);

    this._server._io.set("heartbeat interval", .05);
    this._server._io.set("heartbeat timeout", .05);
    this._server._io.set("close timeout", 0);
  }
}

/* @api private */
IntegrationTest.prototype.stop_server = function() {
  if (this._client) this._client.end();

  if (this._clients.length > 0) {
    for (var d = this._clients.length - 1; d > 0; d--) {
      this._clients[d].end();
    }
  }

  this._server.stop();
}
