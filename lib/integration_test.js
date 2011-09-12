var http = require("http")
  , io = require("socket-io");

module.exports = IntegrationTest = function() {
  this._server = null;
  this._websocket = null;

  Test.call(this);
}
inherits(IntegrationTest, Test);

IntegrationTest.prototype.start_server = function(base_path) {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), get_random_port(), base_path);
  this._server.start();

  /*
  if (this._server._io) {
    this._client = socketio_client.createClient("ws://localhost:" + this._server.port + "/" + io.protocol, { "log-level": 0 });
    this._client.on("connecting", function() {
      console.log("client is connecting");
    });
    this._client.on("connect", function() {
      console.log("client connected");
    });
    this._client.on("error", function() {
      console.log("client error: " + Gourdian.deep_inspect(arguments));
    });
  }
  */
}

IntegrationTest.prototype.stop_server = function() {
  this._server.stop();
}

IntegrationTest.prototype.get = function(path, callback) {
  var self = this;
  (function wait() {
    if (self._server.bound_to_port) {
      var request = http.get({host: "localhost", port: self._server.port, path: path}, callback);
      request.on("error", function(err) {
        Gourdian.logger.debug("Error: " + err.message);
      });
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
