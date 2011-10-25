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
 * @param {Object} client_session
 * @param {Object} request
 * @param {Object} response
 * @api public
 */
ControllerLoader.prototype.run = function(route, client_session, request, response) {
  var action = this.get(route, client_session, request);

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
 * @param {Object} client_session
 * @param {Object) request
 * @param {Object} socket
 * @param {String} message
 * @param {Object} sockets
 * @return {Function} reference to controller action method
 * @api public
 */
ControllerLoader.prototype.get = function(route, client_session, request, socket, message, sockets) {
  Logger.info("Looking up: " + route.controller + "." + route.action);
  var controller = get_controller_name_from_prefix(route.controller)
    , action = route.action;

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
  controller_instance.request = request;
  controller_instance.session = client_session;
  controller_instance.socket = socket;
  controller_instance.message = message;
  controller_instance.sockets = sockets;

  // return the action bound to the instance context, returning its value
  return (function () {
    return controller_instance[action].call(controller_instance);
  });
}

/* @api private */
function get_controller_name_from_prefix(prefix) {
  return ext.Inflect.classify([prefix, "controller"].join("_"));
}
