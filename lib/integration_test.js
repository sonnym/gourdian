module.exports = IntegrationTest = function() {
  this._client = null;
  this._server = null;

  Test.call(this);
}
inherits(IntegrationTest, Test);

IntegrationTest.prototype.start_server = function(base_path) {
  var port = get_random_port();

  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), port, base_path);
  this._server.start();

  if (this._server._io) {
    this._client = new TestClient(port);

    var self = this;
    this._server._io.configure(function() {
      self._server._io.set("heartbeat interval", .05);
      self._server._io.set("heartbeat timeout", .05);
      self._server._io.set("close timeout", 0);
    });
  }
}

IntegrationTest.prototype.__defineGetter__("bound", function() { return this._server && this._server.bound_to_port });

IntegrationTest.prototype.get = function(path, callback) {
  this._client.get(path, callback, this);
}

IntegrationTest.prototype.ws_connect = function(callback) {
  this._client.ws_connect(callback, this);
}

IntegrationTest.prototype.stop_server = function() {
  this._server.stop();
  if (this._client) this._client.end();
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
