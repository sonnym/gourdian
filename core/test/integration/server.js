module.exports = ServerTest = function() {
  IntegrationTest.call(this);

  this.server_responds_to_static_file_request = function() {
    var finish = this.start();

    this.get("/index.html", function(response) {
      assert.equal(response.statusCode, 200);
      finish();
    });
  }
}
inherits(ServerTest, IntegrationTest);

