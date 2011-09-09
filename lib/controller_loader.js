var controllers = {};

exports = module.exports = ControllerLoader;
function ControllerLoader(base_path) {
  this._template_loader = new TemplateLoader(base_path);

  var controllers_dir = path.join(base_path, "app", "c");

  if (path.existsSync(controllers_dir)) {
    var controller_files = fs.readdirSync(controllers_dir);

    for (var c in controller_files) {
      var controller_file = controller_files[c];

      if (path.extname(controller_file) !== ".js") {
        Gourdian.logger.error("Warning: Controller files must have an extension of .js (omitting: " + controller_file + ")");
        continue;
      }

      var filename_wo_ext = controller_file.substring(0, controller_file.length - 3)
        , class_name = get_controller_name_from_prefix(filename_wo_ext)

      if (global[class_name] !== undefined) {
        Gourdian.logger.error("Warning: naming conflict (omitting:" + class_name + ")");
        return;
      }

      global[class_name] = controllers[class_name] = require(path.join(controllers_dir, controller_file));
      Gourdian.logger.info("File: " + controller_file + " loaded as " + class_name);
    }
  }
}

ControllerLoader.prototype.run = function(route, response) {
  Gourdian.logger.info("Serving: " + route.controller + "." + route.action);
  var controller = get_controller_name_from_prefix(route.controller)
    , action = route.action;

  // ensure controller is in the cache
  if (controllers[controller] === undefined || !controllers[controller]) {
    Gourdian.logger.error("Warning: Controller " + controller + " not found");
    return false;
  }

  // ensure the controller properly instantiates and the action is a function
  var controller_instance = new controllers[controller];
  if (typeof controller_instance[action] !== "function") {
    Gourdian.logger.error("Warning: No action " + action + " on " + controller);
    return false;
  }

  var action_result = controller_instance[action]();

  // full response
  if (typeof action_result === "string") {
    response.writeHead(200, { "Content-Length": action_result.length, "Content-Type": "text/html" });
    response.end(action_result);

  // chunked response
  } else if (typeof action_result === "object") {
    var template_path = path.join(route.controller, route.action);

    Gourdian.logger.info("Looking up template for " + template_path);
    this._template_loader.run(template_path, "dust", action_result, response);
  }
}

function get_controller_name_from_prefix(prefix) {
  return ext.Inflect.classify([prefix, "controller"].join("_"));
}