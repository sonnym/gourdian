var Gourdian = require("./../../lib/gourdian");
var Configuration = require("./../../lib/configuration");

var config = new Configuration();
config.base_path = path.join(Gourdian.ROOT, "test", "fixtures", "application");
config.rebuild_paths();

var AcceptanceTest = require("./../../lib/tests/acceptance");

exports.setUp = function(callback) {
  this.acceptance = new AcceptanceTest();
  this.acceptance.start_server();
  callback();
}

exports.tearDown = function (callback) {
  this.acceptance.stop_server();
  callback();
}

exports.can_follow_a_link = function(test) {
  this.acceptance.get("/", function(client) {
    client.clickLink("dynamic", function(err) {
      test.ok(client.response[2].indexOf("created dynamically") > -1);
      test.done();
    });
  });
}
