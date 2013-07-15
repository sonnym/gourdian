var http = require("http");
var path = require("path");

var HTTPClient = require(path.join(require.resolve("socket.io"), "..", "support", "test-client.js"));
var io = require("socket.io");

/* constructor */
var TestClient = module.exports = function(test) {
  this._test = test;

  this._server_port = test._port;

  this._http_client = new HTTPClient(this._server_port);
  this._cookie = null;

  this._socket = null;
  this._connected = false;
  this._heartbeats = 0;
}

/* @returns {Number} cumulative heartbeats */
TestClient.prototype.__defineGetter__("heartbeats", function() {
  return this._heartbeats
});

/* @returns {Number} socket id */
TestClient.prototype.__defineGetter__("sid", function() {
  return this._socket ? this._socket.sid : null
});

/* @returns {String} cookie id */
TestClient.prototype.__defineGetter__("cookie", function() {
  return this._cookie
});

/* issue get request
 *
 * @param {String} path
 * @param {Function} callback
 ** response
 * @api public
 */
TestClient.prototype.get = function(path, callback) {
  var self = this;
  Gourdian.ext.Sync.wait_for(function() { return self._test.bound }, function() {
    var options = {host: "127.0.0.1", port: self._server_port, path: path};
    if (self._cookie !== null) {
      options.headers = {"Cookie": self._cookie };
    }

    http.get(options, function(response) {
      if (response.headers["set-cookie"]) {
        self._cookie = response.headers["set-cookie"][0].split("; ")[0].split("=")[1];
      }

      callback(response);

      response.resume();
    }).on("error", function(e) { console.log(e) });
  });
}

/* issue post request
 *
 * @param {String} path
 * @param {Object} body
 * @param {Function} callback
 ** response
 * @api public
 */
TestClient.prototype.post = function(path, body, callback) {
  var self = this;
  Gourdian.ext.Sync.wait_for(function() { return self._test.bound }, function() {
    var options = {host: "127.0.0.1", port: self._server_port, method: "POST", path: path};
    if (self._cookie !== null) {
      options.headers = {"Cookie": self._cookie };
    }

    var request = http.request(options, function(response) {
      if (response.headers["set-cookie"]) {
        self._cookie = response.headers["set-cookie"][0].split("; ")[0].split("=")[1];
      }

      callback(response);

      response.resume();
    }).on("error", function(e) { console.log(e) });

    request.end(require("querystring").stringify(body));
  });
}

/* handshake with server
 *
 * @param {Object} opts
 * @param {Function} callback called after websocket is created
 * @api public
 */
TestClient.prototype.ws_handshake = function(opts, callback) {
  var self = this;
  Gourdian.ext.Sync.wait_for(function() { return self._test.bound }, function() {
    self._http_client.handshake(opts, function(sid) {
      self._socket = websocket(self._http_client, sid);

      self._socket.on("message", function(msg) {
        if (msg && msg.type && msg.type === "connect") {
          self._connected = true;

        } else if (msg && msg.type && msg.type === "heartbeat") {
          self._socket.packet({ type: 'heartbeat' });
          self._heartbeats++;
        }
      });

      if (callback) callback();
    });
  });
}

/* connect with server
 *
 * @param {Function} callback called after open event
 * @param {Object} test caller
 * @api public
 */
TestClient.prototype.ws_connect = function(callback) {
  var self = this;
  this.ws_handshake({}, function() {
    self._socket.on("open", function() {
      callback();
    });

    self._socket.on("error", function (e) { console.log(e) });
  });
}

/* sends a packet to the server
 *
 * for a comprehensive list of packet types, see lib/parser.js in socket.io
 *
 * @param {Object} packet
 * @api public
 */
TestClient.prototype.ws_send_packet = function(packet) {
  var self = this;
  Gourdian.ext.Sync.wait_for(function() { return self._connected }, function() {
    self._socket.packet(packet);
  });
}

/* emits an event of name with data
 *
 * @param {String} name
 * @param {Object} data
 * @api public
 */
TestClient.prototype.ws_emit = function(name, data) {
  this.ws_send_packet({type: "event", name: name, args: [data]});
}

/* @api private */
TestClient.prototype.end = function(close_callback) {
  this._http_client.end();

  if (!this._socket) {
    return;
  }

  if (close_callback) {
    this._socket.on("close", function() {
      close_callback();
    });
  }

  this._socket.finishClose();
}
