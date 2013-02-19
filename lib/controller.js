var url = require("url");

var _ = require("underscore");

var Controller = module.exports = function() {
  this._params = null;
  this._request = null;
  this._response = null;
  this._session = null;
  this._socket = null;
  this._sockets = null;
  this._message = null;
}

Controller.prototype.__defineSetter__("request", function(request) {
  if (!request) return;

  this._request = request;
  this._params = url.parse(this._request.url, true).query;

  if (this._request.body.length > 0) {
    _.extend(this._params, require("querystring").parse(this._request.body));
  }
});
Controller.prototype.__defineSetter__("response", function(r) { this._response = r });
Controller.prototype.__defineSetter__("session", function(s) { this._session = s });
Controller.prototype.__defineSetter__("socket", function(id) { this._socket = id });
Controller.prototype.__defineSetter__("sockets", function(o) { this._sockets = o });
Controller.prototype.__defineSetter__("message", function(m) { this._message = m });
