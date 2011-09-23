module.exports = ControllerLoaderTest = function() {
  Test.call(this);

  var fixture_path = path.join(Gourdian.framework_root, "test", "fixtures", "application")
    , controller_loader = new ControllerLoader(fixture_path);

  this.loads_nested_controller = function() {
    return;
    var controller_action = controller_loader.get({controller: "nested/resource", action: "action" });

    assert.ok(controller_action);
    assert.equal(controller_action(), "irrelevant");
  }
}
inherits(ControllerLoaderTest, Test);
