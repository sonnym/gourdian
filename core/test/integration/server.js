var ServerTest = function() {
  IntegrationTest.call(this);

  this.server_responds_to_http_requests = function() {
    assert.ok(false);
  }
}

inherits(ServerTest, IntegrationTest);
module.exports = ServerTest;
