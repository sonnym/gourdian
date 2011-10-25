/* constructor
 *
 * @api public
 */
module.exports = ControllerLoader = function() {
  this._template_loader = new TemplateLoader();
  this._controllers = {};

  var self = this
    , configuration = new Configuration()
    , class_loader = new ClassLoader();

  configuration.operate_on_paths(["app", "controllers"], function(error, controllers_path) {
    class_loader.load(controllers_path, function(class_name, class_reference) {
      self._controllers[class_name] = class_reference;
    }, {pollute: false, prefix: 1});
  });
}

/* run a controller specified by a route
 *
 * @param {Object} route
 ** controller
 ** action
 * @param {Object} session
 * @param {Object} request
 * @param {Object} response
 * @api public
 */
ControllerLoader.prototype.run = function(route, session, request, response) {
  var action = this.get({ route: route
                        , session: session
                        , request: request
                        , response: response
                        });

  Logger.info("Serving: " + route.controller + "." + route.action);

  var action_result = action();

  // full response
  if (typeof action_result === "string") {
    response.writeHead(200, { "Content-Length": action_result.length, "Content-Type": "text/html" });
    response.end(action_result);

  // chunked response
  } else if (typeof action_result === "object") {
    var template_path = path.join(route.controller, route.action);

    Logger.info("Looking up template for " + template_path);
    this._template_loader.run(template_path, "dust", action_result, response);
  }
}

/* retuns a reference to the controller action method bound in the context of the controller
 *
 * useful in the case where events must be bound for delayed execution
 *
 * @param {Object} route
 ** controller
 ** action
 * @param {Object} opt
 ** session
 ** request
 ** response
 ** socket
 ** message
 ** sockets
 * @return {Function} reference to controller action method
 * @api public
 */
ControllerLoader.prototype.get = function(opt) {
  if (!opt || !opt.route) return;

  Logger.info("Looking up: " + opt.route.controller + "." + opt.route.action);
  var controller = get_controller_name_from_prefix(opt.route.controller)
    , action = opt.route.action;

  // ensure controller is in the cache
  if (this._controllers[controller] === undefined || !this._controllers[controller]) {
    Logger.error("Warning: Controller " + controller + " not found");
    return false;
  }

  // ensure the controller properly instantiates and the action is a function
  var controller_instance = new this._controllers[controller];
  if (typeof controller_instance[action] !== "function") {
    Logger.error("Warning: No action " + action + " on " + controller);
    return false;
  }

  // add context
  controller_instance.message = opt.message;
  controller_instance.request = opt.request;
  controller_instance.response = opt.response;
  controller_instance.session = opt.session;
  controller_instance.socket = opt.socket;
  controller_instance.sockets = opt.sockets;

  // return the action bound to the instance context, returning its value
  return (function () {
    try {
      return controller_instance[action].call(controller_instance);
    } catch (e) {
      if (opt.respones) {
        opt.response.writeHead(500);
        opt.response.end(e.message + "\n\n\n" + e.stack);
      }

      Logger.error("An error occurred processing a socket request: " + e.message + "\n" + e.stack);
    };
  });
}

/* @api private */
function get_controller_name_from_prefix(prefix) {
  return ext.Inflect.classify([prefix, "controller"].join("_"));
}
