var path = require("path");

var Gourdian = require("./../../lib/gourdian");

var config = Gourdian.Configuration;
config.base_path = require("path").join(Gourdian.ROOT, "test", "fixtures", "application");
config.rebuild_paths();

var IntegrationTest = require("./../../lib/tests/integration");

exports.setUp = function(callback) {
  this.integration = new IntegrationTest();
  this.integration.start_server();
  callback();
}

exports.tearDown = function (callback) {
  this.integration.stop_server();
  callback();
}

exports.server_responds_to_nonexistent_static_file_request_with_a_404 = function(test) {
  this.integration.get("/dne.html", function(response) {
    test.equal(response.statusCode, 404);
    test.done();
  });
}

exports.server_responds_to_static_file_request = function(test) {
  this.integration.get("/index.html", function(response) {
    test.equal(response.statusCode, 200);
    test.done();
  });
}

exports.server_responds_to_top_level_request = function(test) {
  this.integration.get("/", function(response) {
    test.equal(response.statusCode, 200);
    test.done();
  });
}

exports.can_fetch_transporter_include = function(test) {
  this.integration.get("/lib/transporter/receiver.js", function(response) {
    test.equal(response.statusCode, 200);
    test.done();
  });
}

exports.can_fetch_a_shared_resource_from_the_server = function(test) {
  this.integration.get("/lib/shared.js", function(response) {
    test.equal(response.statusCode, 200);
    test.done();
  });
}

exports.server_responds_to_unchunked_dynamic_requests = function(test) {
  this.integration.get("/welcome", function(response) {
    test.equal(response.statusCode, 200);
    test.done();
  });
}

exports.server_responds_to_chunked_dynamic_requests_via_template_loader = function(test) {
  this.integration.get("/streaming", function(response) {
    test.equal(response.complete, false);
    test.equal(response.headers["transfer-encoding"], "chunked");
    test.equal(response.statusCode, 200);

    response.on("end", function() {
      test.equal(response.complete, true);
      test.done();
    });
  });
}

exports.server_can_access_params_from_query_string = function(test) {
  this.integration.get("/params?id=secret", function(response) {
    test.equal(response.statusCode, 200);

    var data = "";
    response.on("data", function(d) { data += d });
    response.on("end", function() {
      test.equal(data, "secret");
      test.done();
    });
  });
}

exports.server_can_access_params_from_request_body = function(test) {
  this.integration.post("/form", { secret: "message" }, function(response) {
    test.equal(response.statusCode, 200);

    var data = "";
    response.on("data", function(d) { data += d });
    response.on("end", function() {
      test.equal(data, "message");
      test.done();
    });
  });
};

exports.server_catches_and_reports_exceptions_in_controller_action = function(test) {
  this.integration.get("/error", function(response) {
    test.equal(response.statusCode, 500);

    var data = "";
    response.on("data", function(d) { data += d });

    response.on("end", function() {
      test.equal(data.substring(0, 10), "test error");
      test.done();
    });
  });
}
