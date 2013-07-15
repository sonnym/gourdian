var Gourdian  = require("gourdian");

exports.resolve_class_nam = function(test) {
  test.ok(Gourdian.ClassLoader.resolve_class_name("tests/acceptance.js"), "AcceptanceTest");
  test.ok(Gourdian.ClassLoader.resolve_class_name("tests/nests/another.js"), "AnotherNestTest");
  test.ok(Gourdian.ClassLoader.resolve_class_name("tests/nest/another.js"), "NestAnotherTest");
  test.ok(Gourdian.ClassLoader.resolve_class_name("test/nest/another.js"), "TestNestAnother");

  test.done();
}
