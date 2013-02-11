var path = require("path");
var _ = require("underscore");

var ext = require("./../../lib/ext");

var Gourdian = require("./../../lib/gourdian");
var Configuration = require("./../../lib/configuration");

exports.is_singleton = function(test) {
  var config_1 = new Configuration();
  var config_2 = new Configuration();

  test.ok(config_1 === config_2);
  test.done();
}

this.configuration_automatically_adds_gourd_paths = function(test) {
  var config = new Configuration();
  config.base_path = path.join(Gourdian.ROOT, "test", "fixtures", "application");
  config.rebuild_paths();

  test.equal(config.paths.length, 2);
  test.done();
}

exports.operate_on_paths = function(test) {
  var config = new Configuration();
  var operated_paths = [];

  config.operate_on_paths(["."], function(error, filename) {
    operated_paths.push(filename);
  });

  ext.Sync.wait_for(function() { return config.paths.length === operated_paths.length }, function() {
    test.equal(operated_paths.length, _.uniq(operated_paths).length);
    test.done();
  });
}
