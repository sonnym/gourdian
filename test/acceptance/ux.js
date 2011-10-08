var zombie = require("zombie");
module.exports = UXTest = function() {
  AcceptanceTest.call(this);

  var async = this.start();

  this.can_follow_a_link = function() {
    var client = this.add_client();

    this.get("/", function(client) {
      client.clickLink("dynamic", function(err, browser, status) {
        assert.ok(browser.response[2].indexOf("created dynamically") > -1);
        async.finish();
      });
    });
  };
}
inherits(UXTest, AcceptanceTest);
