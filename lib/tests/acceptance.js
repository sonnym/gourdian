/* dependencies */
var zombie = require("zombie");

/* constructor */
module.exports = AcceptanceTest = function() {
  this._clients = [];

  this._server = null;
  this._port = 8000 + Math.floor(Math.random() * 1000);

  Test.call(this);
}
inherits(AcceptanceTest, Test);

/* start the server with application at given path
 *
 * @api public */
AcceptanceTest.prototype.start_server = function() {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), this._port);
  this._server.start();

  if (this._server._io) {
    this._server._io.set("heartbeat interval", .05);
    this._server._io.set("heartbeat timeout", .05);
    this._server._io.set("close timeout", 0);
  }
}

/* @api private */
AcceptanceTest.prototype.stop_server = function() {
  this._server.stop();
}

/* create a new client
 *
 * @returns {Object} reference to client
 * @api public
 */
AcceptanceTest.prototype.add_client = function() {
  var client = new zombie.Browser();
  this._clients.push(client);
  return client;
}

/* get a path from the test server
 *
 * @param {String} url_path path to resource
 * @param {Function} callback called with zombie client object
 */
AcceptanceTest.prototype.get = function(url_path, callback) {
  var self = this;
  ext.Sync.wait_for(function() { return self._server.bound_to_port }, function() {
    zombie.visit("http://localhost:" + self._port + url_path, function(err, client) {
      if (err) self._error = err;
      else callback(client);
    });
  });
}
