/* constructor
 *
 * @api public
 */
module.exports = ModuleLoader = function() {
  var configuration = new Configuration()
    , class_loader = new ClassLoader();

  configuration.operate_on_paths(["app", "models"], function(error, models_path) {
    class_loader.load(models_path, null, {pollute: true, prefix: 1});
  });
};
