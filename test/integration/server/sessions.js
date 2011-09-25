module.exports = ServerSessionsTest = function() {
  IntegrationTest.call(this);

  var async = this.start();

  this.client_gets_a_cookie_on_request = function() {
    var self = this;
    this.get("/index.html", function(response) {
      var cookie_id = self._client.cookie;

      // 32 byte sha1
      assert.equal(cookie_id.length, 32);
      async.finish();
    });
  }

  this.client_gets_a_cookie_only_on_first_request = function() {
    var self = this;
    this.get("/index.html", function() {
      self.get("/index.html", function(response) {
        assert.ok(response.headers["set-cookie"] === undefined);
        async.finish();
      });
    });
  }

  this.client_can_save_information_in_a_session = function() {
    var self = this;
    this.get("/store/save", function() {
      assert.equal(self._server._session_store.get(self._client.cookie).hello, "world");
      async.finish();
    });
  }

  this.client_can_save_and_retrieve_data_in_a_session = function() {
    var self = this;
    this.get("/store/save", function() {
      assert.equal(self._server._session_store.get(self._client.cookie).hello, "world");

      self.get("/store/check", function(response) {
        response.on("data", function(data) {
          assert.equal(data, "world");
          async.finish();
        });
      });
    });
  }
}
inherits(ServerSessionsTest, IntegrationTest);
