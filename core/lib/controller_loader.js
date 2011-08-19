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

ControllerLoader.prototype.run = function(route, response) {
  var controller = get_controller_name_from_prefix(route.controller)
    , action = route.action;

  if (controllers[controller] === undefined || !controllers[controller]) {
    console.log("Warning: Controller " + controller + " not found");
    return false;

  } else if (typeof controllers[controller][action] !== "function") {
    console.log("Warning: No action " + action + " on " + controller);
    return false;

  }

  var action_result = controllers[controller][action]();
  /* == call template cache here == */

  // full response
  if (typeof action_result === "string") {
    response.writeHead(200, { "Content-Length": action_result.length, "Content-Type": "text/html" });
    response.end(action_result);

  // chunked response
  } else if (typeof action_result === "object") {
    /* == call template cache here or here? == */
    response.writeHead(200, { "Content-Type": "text/html" });

    // function must be an event emitter w/ data, end, and error
    action_result.on("data", function(data) {
      response.write(data);
    });
    action_result.on("end", function() {
      response.end();
    });
    action_result.on("error", function(error) {
      Gourdian.logger.info("Error: " + error);
    });
  }
}

function get_controller_name_from_prefix(prefix) {
  return ext.Inflect.classify([prefix, "controller"].join("_"));
}
