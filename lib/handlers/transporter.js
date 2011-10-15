/* dependencies */
var Transporter = require("transporter/lib/jsgi/transporter.js").Transporter;

/* constructor */
module.exports = TransporterHandler = function() {
  IHandler.call(this);

  this._lib_path = null;
  this._transporter = null;
}
inherits(TransporterHandler, IHandler);

/* implementation of IHandler.init
 *
 * @api public
 */
TransporterHandler.prototype.init = function(router, base_path) {
  this._lib_path = path.join(base_path, "lib")
  this._transporter = new Transporter({paths: [this._lib_path]});
};

/* implementation of IHandler.handles
 *
 * @api public
 */
TransporterHandler.prototype.handles = function(request) {
  return true;
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
