/* abstract interface */
module.exports = IHandler = function() { }

/* perform initialization actions during server setup
 *
 * @param {Object} router reference to instance of router
 */
IHandler.prototype.init = function(router) {
  throw "method must be implemented";
};

/* determine if this handler will respond to a given request
 *
 * @param {Object} request object
 * @return {Boolean}
 * @api public
 */
IHandler.prototype.handles = function(request) {
  throw "method must be implemented";
};

/* respond to a request
 *
 * @param {Object} request
 * @param {Object} response
 * @param {Object} client_session
 * @api public
 */
IHandler.prototype.handle = function(request, response, client_session) {
  throw "method must be implemented";
};
