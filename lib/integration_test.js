var http = require("http");

module.exports = IntegrationTest = function() {
  this.server = null;

  Test.call(this);
}
inherits(IntegrationTest, Test);

IntegrationTest.prototype.start_server = function(base_path) {
  this._server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), get_random_port(), base_path);
  this._server.start();
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
