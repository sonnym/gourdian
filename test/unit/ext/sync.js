var ext = require("./../../../lib/ext");

exports.wait_for = function(test) {
  var condition = false;

  ext.Sync.wait_for(function() { return condition }, function() {
    test.ok(condition);
    test.done();
  });

  setTimeout(function() { condition = true; }, 20);
}
