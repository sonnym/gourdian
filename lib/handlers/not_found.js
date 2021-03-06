/* constructor */
var NotFoundHandler = module.exports = function() {
  Gourdian.IHandler.call(this);
}
inherits(NotFoundHandler, Gourdian.IHandler);

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
  Gourdian.Logger.info("Serving not found for " + require("url").parse(request.url).pathname);

  response.writeHead(404);
  response.end("Not Found");
};
