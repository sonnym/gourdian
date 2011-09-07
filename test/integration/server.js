module.exports = ServerTest = function() {
  IntegrationTest.call(this);

  this.server_responds_to_nonexistent_static_file_request_with_a_404 = function() {
    var finish = this.start();

    this.get("/dne.html", function(response) {
      assert.equal(response.statusCode, 404);
      finish();
    });
  }

  /*
  this.server_responds_to_static_file_request = function() {
    var finish = this.start();

    this.get("/index.html", function(response) {
      console.log(Gourdian.deep_inspect(response.headers));
      assert.equal(response.statusCode, 200);
      finish();
    });
  }
  */

  this.server_responds_to_unchunked_dynamic_requests = function() {
    var finish = this.start();

    this.get("/welcome", function(response) {
      assert.equal(response.statusCode, 200);
      finish();
    });
  }

  this.server_responds_to_chunked_dynamic_requests_via_template_loader = function() {
    var finish = this.start();

    this.get("/streaming", function(response) {
      assert.equal(response.statusCode, 200);
      console.log(response);
      finish();
    });
  }
}
inherits(ServerTest, IntegrationTest);
