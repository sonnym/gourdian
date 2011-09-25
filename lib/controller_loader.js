var controllers = {};

exports = module.exports = ControllerLoader;
function ControllerLoader(base_path) {
  this._template_loader = new TemplateLoader(base_path);

  var controllers_path = path.join(base_path, "app", "c");

  if (path.existsSync(controllers_path)) {
    ext.File.directory_descent_wrapper(controllers_path, function(controller_file) {
      var stats = fs.statSync(controller_file);
      if (!stats.isFile()) return;

      if (path.extname(controller_file) !== ".js") {
        Gourdian.logger.error("Warning: Controller files must have an extension of .js (omitting: " + controller_file + ")");
        return
      }

      var filename_wo_ext = controller_file.substring(0, controller_file.length - 3)
        , relative_file = filename_wo_ext.replace(controllers_path, "")
        , class_name = get_controller_name_from_prefix(relative_file)

      if (global[class_name] !== undefined) {
        Gourdian.logger.error("Warning: naming conflict (omitting:" + class_name + ")");
        return;
      }

      global[class_name] = controllers[class_name] = require(controller_file);
      Gourdian.logger.info("File: " + controller_file + " loaded as " + class_name);
    });
  }
}

ControllerLoader.prototype.run = function(route, request_body, client_session, response) {
  var action = this.get(route, request_body, client_session);
  
  Gourdian.logger.info("Serving: " + route.controller + "." + route.action);

  var action_result = action();

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

ControllerLoader.prototype.get = function(route, request_body, client_session) {
  Gourdian.logger.info("Looking up: " + route.controller + "." + route.action);
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

  // add context
  controller_instance.request_body = request_body;
  controller_instance.session = client_session;

  return controller_instance[action];
}

function get_controller_name_from_prefix(prefix) {
  return ext.Inflect.classify([prefix, "controller"].join("_"));
}
