exports = module.exports = ControllerLoader;

function ControllerLoader() { }

var controllers = {};

ControllerLoader.prototype.load_controllers = function() {
  var controllers_dir = path.join(Gourdian.ROOT, "app", "c");

  if (path.existsSync(controllers_dir)) {
    var controller_files = fs.readdirSync(controllers_dir);

    for (var c in controller_files) {
      var controller_file = controller_files[c];
      if (path.extname(controller_file) !== ".js") {
        Gourdian.logger.error("Warning: Controller files must have an extension of .js");
        continue;
      }

      var filename_wo_ext = controller_file.substring(0, controller_file.length - 3)
        , class_name = get_controller_name_from_prefix(filename_wo_ext)

      if (global[class_name] !== undefined) {
        Gourdian.logger.warn("Warning: naming conflict");
      } else {
        global[class_name] = controllers[class_name] = require(path.join(controllers_dir, controller_file));
        Gourdian.logger.info("File: " + controller_file + " loaded as " + class_name);
      }
    }
  }
}

ControllerLoader.prototype.run = function(controller_prefix, method) {
  var controller = get_controller_name_from_prefix(controller_prefix)

  if (controllers[controller] === undefined || !controllers[controller]) {
    console.log("Warning: Controller " + controller + " not found");
    return false;

  } else if (typeof controllers[controller][method] !== "function") {
    console.log("Warning: No method " + method + " on " + controller);
    return false;

  } else {
    return controllers[controller][method]();
  }
}

function get_controller_name_from_prefix(prefix) {
  return ext.Inflect.classify([prefix, "controller"].join("_"));
}
