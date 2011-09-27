module.exports = FileExtTest = function() {
  Test.call(this);

  this.reduce_directory_structure_properly_operates_on_an_object = function() {
    var directory_structure = [{ "app": ["m", "v", "c"] }, "config", "log", { "public": ["css", "js"] }, "script", { "test": ["integration", "lib", "performance", "unit"] }]
      , directories = ext.File.reduce_directory_structure("/something", directory_structure);

    assert.equal(directories.length, 15);

    // ensure each entry has the root_path prepended
    assert.equal(Gourdian._.detect(directories, function(dir) { return dir.substring(0, 11) !== "/something/" }), undefined);
  }
}
inherits(FileExtTest, Test);
