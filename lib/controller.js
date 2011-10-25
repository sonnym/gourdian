module.exports = Controller = function() {
  this._params = null;
  this._request = null;
  this._response = null;
  this._session = null;
  this._socket = null;
  this._sockets = null;
  this._message = null;
}

Controller.prototype.__defineSetter__("request", function(request) {
  this._request = request;

  var request_body = "";
  if (this._request && this._request.on) this._request.on("data", function(chunk) { request_body += chunk });
  if (this._request && this._request.url) this._params = url.parse(this._request.url, true).query;
});
Controller.prototype.__defineSetter__("response", function(r) { this._response = r });
Controller.prototype.__defineSetter__("session", function(s) { this._session = s });
Controller.prototype.__defineSetter__("socket", function(id) { this._socket = id });
Controller.prototype.__defineSetter__("sockets", function(o) { this._sockets = o });
Controller.prototype.__defineSetter__("message", function(m) { this._message = m });
