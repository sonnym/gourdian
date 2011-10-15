/* abstract interface */
module.exports = IHandler = function() { }

/* perform initialization actions during server setup
 *
 * @param {Object} router reference to instance of router
 * @param {String} base_path
 */
IHandler.prototype.init = function(router, base_path) {
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
 * @param {Object} request object
 * @param {Object} response object
 * @api public
 */
IHandler.prototype.handle = function(response) {
  throw "method must be implemented";
};
