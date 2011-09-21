var http = require("http")
  , HTTPClient = require(path.join(require.resolve("socket.io"), "..", "test", "common.js"))
  , io = require("socket.io");

module.exports = TestClient = function(server_port) {
  this._server_port = server_port;

  this._http_client = new HTTPClient(this._server_port);

  this._socket = null;
  this._socket_connected = false;
  this._heartbeats = 0;
}

TestClient.prototype.__defineGetter__("heartbeats", function() { return this._heartbeats });
TestClient.prototype.__defineGetter__("sid", function() { return this._socket ? this._socket.sid : null });

TestClient.prototype.get = function(path, callback, test) {
  var self = this;
  (function wait() {
    if (test.bound) {
      var request = http.get({host: "localhost", port: self._server_port, path: path}, function(response) {
        try {
          callback(response);
        } catch(e) {
          test._error = e;
        }
      });
      request.on("error", function(e) { test._error = e });
    } else {
      setTimeout(wait, null);
    }
  })();
}

TestClient.prototype.ws_connect = function(callback, test) {
  // do not proceed if socket.io is not started or if client is initialized
  if (!test._server._io) throw new Error("NOSERVER");

  var self = this;
  (function wait() {
    if (test.bound) {
      self._http_client.handshake(function(sid) {
        self._socket = websocket(self._http_client, sid);

        self._socket.on("message", function(msg) {
          if (msg && msg.type && msg.type === "connect") {
            self._connected = true;

          } else if (msg && msg.type && msg.type === "heartbeat") {
            self._socket.packet({ type: 'heartbeat' });
            self._heartbeats++;
          }
        });

        self._socket.on("open", function() {
          try {
            callback();
          } catch(e) {
            test._error = e;
          }
        });

        self._socket.on("error", function (e) { test._error = e });
      });
    } else {
      setTimeout(wait, null);
    }
  })();
}

TestClient.prototype.end = function() {
  this._http_client.end();
  if (this._socket) this._socket.finishClose();
}
