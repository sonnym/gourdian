/* module variables */
var path = require("path");

var Gourdian = require("gourdian");

var port_offset = 0;
var TestClient = require("./../test_client");

/* constructor */
var PerformanceTest = module.exports = function() {
  this._server = null;
  this._clients = [];
  this._port = 47000 + (port_offset++);

  // effectively removes timeout
  this._parallel = true;
  this._start = null;
}

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
  this._server = new Gourdian.Server(path.join(Gourdian.ROOT, "log", "test.log"), this._port);
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
  var total = this._clients.length;

  for (var i = 0, l = this._clients.length; i < l ; i++) {
    this._clients[i].end(function() {
      total--;
    });
  }

  var self = this;
  Gourdian.ext.Sync.wait_for(function() { return total === 0 }, function() {
    self._server.stop();
  });
}
