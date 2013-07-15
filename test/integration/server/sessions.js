var Gourdian = require("./../../../lib/gourdian");

var config = Gourdian.Configuration;
config.base_path = require("path").join(Gourdian.ROOT, "test", "fixtures", "application");
config.rebuild_paths();

var IntegrationTest = require("./../../../lib/tests/integration");

exports.setUp = function(callback) {
  this.integration = new IntegrationTest();
  this.integration.start_server();
  callback();
}

exports.tearDown = function (callback) {
  this.integration.stop_server();
  callback();
}

exports.client_gets_a_cookie_on_request = function(test) {
  var self = this;
  this.integration.get("/index.html", function(response) {
    var cookie_id = self.integration._client.cookie;

    // 32 byte sha1
    test.equal(cookie_id.length, 32);
    test.done();
  });
}

exports.client_gets_a_cookie_only_on_first_request = function(test) {
  var self = this;
  this.integration.get("/index.html", function() {
    self.integration.get("/index.html", function(response) {
      test.ok(response.headers["set-cookie"] === undefined);
      test.done();
    });
  });
}

exports.client_can_save_information_in_a_session = function(test) {
  var self = this;
  this.integration.get("/store/save", function() {
    test.equal(self.integration._server._session_store.get(self.integration._client.cookie).hello, "world");
    test.done();
  });
}

exports.client_can_save_and_retrieve_data_in_a_session = function(test) {
  var self = this;
  this.integration.get("/store/save", function() {
    test.equal(self.integration._server._session_store.get(self.integration._client.cookie).hello, "world");

    self.integration.get("/store/check", function(response) {
      response.on("data", function(data) {
        test.equal(data.toString(), "world");
        test.done();
      });
    });
  });
}
