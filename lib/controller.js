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

_.each(["response", "session", "socket", "sockets", "message"], function(property) {
  Controller.prototype.__defineSetter__(property, function(value) {
    this["_" + property] = value;
  });
});
