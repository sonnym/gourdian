var ClassLoader = require("./../../lib/class_loader");

exports.resolve_class_nam = function(test) {
  var class_loader = new ClassLoader();

  test.ok(class_loader.resolve_class_name("tests/acceptance.js"), "AcceptanceTest");
  test.ok(class_loader.resolve_class_name("tests/nests/another.js"), "AnotherNestTest");
  test.ok(class_loader.resolve_class_name("tests/nest/another.js"), "NestAnotherTest");
  test.ok(class_loader.resolve_class_name("test/nest/another.js"), "TestNestAnother");

  test.done();
}
