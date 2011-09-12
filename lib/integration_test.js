var http = require("http")
  , socketio_client = require("socket.io-node-client");

module.exports = IntegrationTest = function() {
  this._server = null;
  this._websocket = null;

  Test.call(this);
}
inherits(IntegrationTest, Test);

IntegrationTest.prototype.start_server = function(base_path) {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), get_random_port(), base_path);
  this._server.start();

  this._client = socketio_client.createClient("http://localhost:" + this._server.port + "/socket.io", { "log-level": 0 });
}

IntegrationTest.prototype.stop_server = function() {
  this._server.stop();
}

IntegrationTest.prototype.get = function(path, callback) {
  var self = this;
  (function wait() {
    if (self._server.bound_to_port) {
      var request = http.get({host: "localhost", port: self._server.port, path: path}, callback);
      request.end();
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
