/* constructor */
module.exports = ActionHandler = function() {
  IHandler.call(this);

  this._router = null;
  this._controller_loader = null;
}
inherits(ActionHandler, IHandler);

/* implementation of IHandler.init
 *
 * @api public
 */
ActionHandler.prototype.init = function(router, base_path) {
  this._router = router;
  this._controller_loader = new ControllerLoader(base_path);
};

/* implementation of IHandler.handles
 *
 * @api public
 */
ActionHandler.prototype.handles = function(request) {
  return this._router.lookup_action_route(request.url);
};

/* implementation of IHandler.handle
 *
 * @api public
 */
ActionHandler.prototype.handle = function(request, response, request_body, session) {
  var action_route = this._router.lookup_action_route(request.url);
  Gourdian.logger.info("Serving action: " + action_route.controller + "." + action_route.action);

  this._controller_loader.run(action_route, session, request_body, response);
};
