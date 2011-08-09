var ServerTest = function() {
  UnitTest.call(this);

  this.server_starts = function() {
    var server = new Server();
    assert.ok(server.start());
  };
}

inherits(ServerTest, UnitTest);
module.exports = ServerTest;
