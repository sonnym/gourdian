var http = require("http")
  , server;

exports = module.exports = IntegrationTest;
function IntegrationTest() {
  Test.call(this);

  server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), get_random_port());
  if (!server.start()) console.log("Warning: Test server did successfully start");
}

inherits(IntegrationTest, Test);

IntegrationTest.prototype.get = function(path, callback) {
  ensure_server_is_bound(function() {
    var request = http.get({host: "localhost", port: server.port, path: path}, callback);
    request.end();
  });
}

// private

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
