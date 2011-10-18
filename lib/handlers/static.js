/* dependencies */
var NodeStatic = require("node-static")

/* constructor */
module.exports = StaticHandler = function() {
  IHandler.call(this);

  this._router = null;

  this._file_server = null;
  this._public_path = null;
}
inherits(StaticHandler, IHandler);

/* implementation of IHandler.init
 *
 * @api public
 */
StaticHandler.prototype.init = function(router) {
  if (!router.root) {
    Gourdian.logger.info("No root path found, static file server will not be started");
    return;
  }

  var configuration = new Configuration();

  this._router = router;

  this._public_path = path.join(configuration.base_path, router.root.root);
  this._file_server = new NodeStatic.Server(this._public_path);

  Gourdian.logger.info("Starting static file server at: " + this._public_path)
};

/* implementation of IHandler.handles
 *
 * @api public
 */
StaticHandler.prototype.handles = function(request) {
  return this._file_server && path.existsSync(path.join(this._base_path, this._public_path, url.parse(request.url).pathname));
};

/* implementation of IHandler.handle
 *
 * @api public
 */
StaticHandler.prototype.handle = function(request, response) {
  Gourdian.logger.info("Serving static file: " + path.join(this._public_path, url.parse(request.url).pathname));
  this._file_server.serve(request, response, function() {
    response.end();
  });
};
