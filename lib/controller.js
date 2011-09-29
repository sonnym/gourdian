module.exports = Controller = function() {
  this._session = null;
  this._request_body = null;
  this._socket_id = null;
  this._message = null;
}

Controller.prototype.__defineSetter__("session", function(s) { this._session = s });
Controller.prototype.__defineSetter__("request_body", function(b) { this._request_body = b });
Controller.prototype.__defineSetter__("socket_id", function(id) { this._socket_id = id });
Controller.prototype.__defineSetter__("message", function(m) { this._message = m });
