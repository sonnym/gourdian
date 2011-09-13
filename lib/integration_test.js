var http = require("http")
  , socketio_client = require("socket.io-node-client")
  , io = require("socket-io");

module.exports = IntegrationTest = function() {
  this._client = null;
  this._server = null;

  Test.call(this);
}
inherits(IntegrationTest, Test);

IntegrationTest.prototype.start_server = function(base_path) {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), get_random_port(), base_path);
  this._server.start();
}

IntegrationTest.prototype.stop_server = function() {
  this._server.stop();
  if (this._client) this._client.close();
}

IntegrationTest.prototype.get = function(path, callback) {
  var self = this;
  (function wait() {
    if (self._server.bound_to_port) {
      var request = http.get({host: "localhost", port: self._server.port, path: path}, callback);
      request.on("error", function(err) {
      });
    } else {
      setTimeout(wait, null);
    }
  })();
}

IntegrationTest.prototype.ws_connect = function(callback) {
  // do not proceed if socket.io is not started or if client is initialized
  if (!this._server._io || this._client) return;

  var self = this;
  (function wait() {
    if (self._server.bound_to_port) {
      self._client = socketio_client.createClient("http://localhost:" + self._server.port + "/socket.io/" + io.protocol, { autoConnect: false });
      self._client.on("connect", function() {
        callback();
      });

      self._client.connect();
    } else {
      setTimeout(wait, null);
    }
  })();
}

  /////////////
 // private //
/////////////
function get_random_port() {
  var port = 8000 + Math.floor(Math.random() * 1000);

  /* check if random port is in use
  require("child_process").exec("lsof -i | awk '{ print $9 \" \" $10 }' | grep *:" + port + " (LISTEN)", function(error, stdout, stderr) {
    if (stdout === "") // in use
    else return port;
  });
  */

  return port;
}
