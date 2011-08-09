var ServerTest = function() {
  UnitTest.call(this);

  this.server_starts_and_stops = function() {
    var server = new Server();
    assert.ok(server.start());
    assert.ok(server.stop());
  };
}

inherits(ServerTest, UnitTest);
module.exports = ServerTest;
