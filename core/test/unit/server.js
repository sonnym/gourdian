var ServerTest = function() {
  Test.call(this);

  this.server_starts_and_stops = function() {
    var server = new Server(path.join(Gourdian.ROOT, "log", "test.log"), 9001);
    assert.ok(server.start());
    assert.ok(server.stop());
  };
}

inherits(ServerTest, Test);
module.exports = ServerTest;
