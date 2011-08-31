var http = require("http")
  , server;

module.exports = IntegrationTest = function() {
  Test.call(this);
}
inherits(IntegrationTest, Test);

IntegrationTest.prototype.run_tests = function(only_name, base_path) {
  server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), get_random_port(), base_path);
  server.start();

  Test.prototype.run_tests.call(this, only_name);
}

IntegrationTest.prototype.get = function(path, callback) {
  ensure_server_is_bound.call(this, function() {
    var request = http.get({host: "localhost", port: server.port, path: path}, callback);
    request.end();
  });
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

function ensure_server_is_bound(callback) {
  if (server.bound_to_port) callback();
  else setTimeout(function () { ensure_server_is_bound.call(this, callback) }, null);
}
