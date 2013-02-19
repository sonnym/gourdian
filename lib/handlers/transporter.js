/* dependencies */
var fs = require("fs");
var path = require("path");
var url = require("url");

var Transporter = require("transporter/lib/jsgi/transporter.js").Transporter;

/* constructor */
var TransporterHandler = module.exports = function() {
  Gourdian.IHandler.call(this);

  this._lib_path = null;
  this._transporter = null;
}
inherits(TransporterHandler, Gourdian.IHandler);

/* implementation of IHandler.init
 *
 * @api public
 */
TransporterHandler.prototype.init = function() {
  var configuration = new Gourdian.Configuration();
  this._lib_path = path.join(configuration.base_path, "lib")
  this._transporter = new Transporter({paths: [this._lib_path]});
};

/* implementation of IHandler.handles
 *
 * @api public
 */
TransporterHandler.prototype.handles = function(request) {
  var url_parts = url.parse(request.url).pathname.split("/")
    , penultimate_part = url_parts[url_parts.length - 2]
    , last_part = url_parts[url_parts.length - 1];

  // receiver
  if (penultimate_part === "transporter" && last_part === "receiver.js") {
    return true;
  }

  // remove prefix for any other files
  return this._transporter && fs.existsSync(path.join(this._lib_path, last_part));
};

/* implementation of IHandler.handle
 *
 * @api public
 */
TransporterHandler.prototype.handle = function(request, response) {
  request.pathInfo = request.url; // transporter expects the pathInfo property

  var tp = this._transporter(request)
    , tp_body = "";

  tp.body.forEach(function(body_part) {
    tp_body += body_part;
  });

  tp.headers["Content-Length"] = tp_body.length;

  response.writeHead(tp.status, tp.headers);
  response.end(tp_body);
};
