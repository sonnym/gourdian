var assert = require("assert")
  , http = require("http")
  , client = http.createClient(8124);

exports.can_fetch_index = function() {
  client.request("/", function(response) {
    console.log(response.statusCode);
    assert.equal(response.statusCode, 200);
  });
}
