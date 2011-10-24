module.exports = Controller = function() {
  this._params = null;
  this._request_body = null;
  this._session = null;
  this._socket = null;
  this._sockets = null;
  this._message = null;
}

Controller.prototype.__defineSetter__("params", function(p) { this._params = p });
Controller.prototype.__defineSetter__("request_body", function(b) { this._request_body = b });
Controller.prototype.__defineSetter__("session", function(s) { this._session = s });
Controller.prototype.__defineSetter__("socket", function(id) { this._socket = id });
Controller.prototype.__defineSetter__("sockets", function(o) { this._sockets = o });
Controller.prototype.__defineSetter__("message", function(m) { this._message = m });
