/* dependencies */
var fs = require("fs");
var path = require("path");
var url = require("url");

var NodeStatic = require("node-static")

/* constructor */
var StaticHandler = module.exports = function() {
  Gourdian.IHandler.call(this);

  this._file_server = null;
  this._public_path = null;
}
inherits(StaticHandler, Gourdian.IHandler);

/* implementation of IHandler.init
 *
 * @api public
 */
StaticHandler.prototype.init = function() {
  var configuration = new Gourdian.Configuration();

  this._public_path = path.join(configuration.base_path, "public");

  if (fs.existsSync(this._public_path)) {
    this._file_server = new NodeStatic.Server(this._public_path);
    Gourdian.Logger.info("Starting static file server at: " + this._public_path)
  } else {
    Gourdian.Logger.info("No root path found, static file server will not be started");
  }
};

/* implementation of IHandler.handles
 *
 * @api public
 */
StaticHandler.prototype.handles = function(request) {
  return this._file_server && fs.existsSync(path.join(this._public_path, url.parse(request.url).pathname));
};

/* implementation of IHandler.handle
 *
 * @api public
 */
StaticHandler.prototype.handle = function(request, response) {
  Gourdian.Logger.info("Serving static file: " + path.join(this._public_path, url.parse(request.url).pathname));
  this._file_server.serve(request, response, function() {
    response.end();
  });
};
