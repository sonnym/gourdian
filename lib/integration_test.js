var http = require("http")
  , HTTPClient = require(path.join(require.resolve("socket.io"), "..", "test", "common.js"))
  , io = require("socket.io");

module.exports = IntegrationTest = function() {
  this._client = null;
  this._server = null;

  Test.call(this);
}
inherits(IntegrationTest, Test);

IntegrationTest.prototype.start_server = function(base_path) {
  var self = this;

  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), get_random_port(), base_path);
  this._server.start();

  if (this._server._io) this._server._io.configure(function() {
    self._server._io.set("heartbeat interval", .05);
    self._server._io.set("heartbeat timeout", .05);
    self._server._io.set("close timeout", 0);
  });
}

IntegrationTest.prototype.stop_server = function() {
  this._server.stop();
  if (this._client) {
    this._client.end();
    this._client.socket.finishClose();
  }
}

IntegrationTest.prototype.get = function(path, callback) {
  var self = this;
  (function wait() {
    if (self._server.bound_to_port) {
      var request = http.get({host: "localhost", port: self._server.port, path: path}, function(response) {
        try {
          callback(response);
        } catch(e) {
          self._error = e;
        }
      });
      request.on("error", function(e) { self._error = e });
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
      self._client = new HTTPClient(self._server.port);
      self._client.handshake(function(sid) {
        self._client.socket = websocket(self._client, sid);
        self._client.socket.on("message", function(msg) {
          if (msg && msg.type && msg.type === "connect") {
            self._client.connected = true;
          }
        });
        self._client.socket.on("open", function() {
          try {
            callback();
          } catch(e) {
            self._error = e;
          }
        });
        self._client.socket.on("disconnect", function () { console.log("dis") });
        self._client.socket.on("error", function (e) { self._error = e });
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
