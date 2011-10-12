module.exports = ClassLoaderTest = function() {
  Test.call(this);

  var _class_loader = new ClassLoader();

  this.resolve_class_name = function() {
    assert.ok(_class_loader.resolve_class_name("tests/acceptance.js"), "AcceptanceTest");
    assert.ok(_class_loader.resolve_class_name("tests/nests/another.js"), "AnotherNestTest");
    assert.ok(_class_loader.resolve_class_name("tests/nest/another.js"), "NestAnotherTest");
    assert.ok(_class_loader.resolve_class_name("test/nest/another.js"), "TestNestAnother");
  };
}
inherits(ClassLoaderTest, Test);
