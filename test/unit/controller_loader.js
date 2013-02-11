/*
var path = require("path");

require("./../../lib/gourdian");
var ControllerLoader = require("./../../lib/loaders/controller");

exports.loads_nested_controller = function(test) {
  var fixture_path = path.join(Gourdian.framework_root, "test", "fixtures", "application")
    , controller_loader = new ControllerLoader(fixture_path);

  var controller_action = controller_loader.get({controller: "nested/resource", action: "action" });

  test.ok(controller_action);
  test.equal(controller_action(), "irrelevant");

  test.done();
}
*/
