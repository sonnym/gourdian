/* constructor */
module.exports = NotFoundHandler = function() {
  IHandler.call(this);
}
inherits(NotFoundHandler, IHandler);

/* implementation of IHandler.init
 *
 * @api public
 */
NotFoundHandler.prototype.init = function() { };

/* implementation of IHandler.handles
 *
 * @api public
 */
NotFoundHandler.prototype.handles = function(request) {
  return true;
};

/* implementation of IHandler.handle
 *
 * @api public
 */
NotFoundHandler.prototype.handle = function(request, response) {
  response.writeHead(404);
  response.end("Not Found");
};
