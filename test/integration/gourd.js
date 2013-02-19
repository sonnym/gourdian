var path = require("path");

var Gourdian = require("./../../lib/gourdian");
var IntegrationTest = require("./../../lib/tests/integration");

var config = new Gourdian.Configuration();
config.base_path = require("path").join(Gourdian.ROOT, "test", "fixtures", "application");
config.rebuild_paths();

exports.setUp = function(callback) {
  this.integration = new IntegrationTest();
  this.integration.start_server();
  callback();
}

exports.gourd_responds_to_unchunked_dynamic_requests = function(test) {
  this.integration.get("/gourd_resource", function(response) {
    var response_body = "";

    response.on("data", function(data) {
      response_body += data.toString()
    });

    response.on("end", function() {
      test.equal(response.statusCode, 200);
      test.equal(response_body, "hello");
      test.done();
    });
  });
}

exports.gourd_responds_to_chunked_dynamic_requests_via_template_loader = function(test) {
  this.integration.get("/gourd_resource_with_template", function(response) {
    test.equal(response.complete, false);
    test.equal(response.headers["transfer-encoding"], "chunked");
    test.equal(response.statusCode, 200);

    var r_body = "";
    response.on("data", function(d) { r_body += d });

    response.on("end", function() {
      test.equal(response.complete, true);
      test.equal(r_body, "Streaming be here!");
      test.done();
    });
  });
}

exports.tearDown = function (callback) {
  this.integration.stop_server();
  callback();
}
