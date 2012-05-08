/* dependencies */
var NodeStatic = require("node-static")

/* constructor */
module.exports = StaticHandler = function() {
  IHandler.call(this);

  this._file_server = null;
  this._public_path = null;
}
inherits(StaticHandler, IHandler);

/* implementation of IHandler.init
 *
 * @api public
 */
StaticHandler.prototype.init = function() {
  var configuration = new Configuration();

  this._public_path = path.join(configuration.base_path, "public");

  if (fs.existsSync(this._public_path)) {
    this._file_server = new NodeStatic.Server(this._public_path);
    Logger.info("Starting static file server at: " + this._public_path)
  } else {
    Logger.info("No root path found, static file server will not be started");
  }
};

/* implementation of IHandler.handles
 *
 * @api public
 */
StaticHandler.prototype.handles = function(request) {
  return this._file_server && fs.existsSync(path.join(this._base_path, this._public_path, url.parse(request.url).pathname));
};

/* implementation of IHandler.handle
 *
 * @api public
 */
StaticHandler.prototype.handle = function(request, response) {
  Logger.info("Serving static file: " + path.join(this._public_path, url.parse(request.url).pathname));
  this._file_server.serve(request, response, function() {
    response.end();
  });
};
