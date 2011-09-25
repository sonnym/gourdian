module.exports = Controller = function() {
  this._session = null;
  this._reqeust_body = null;
}

Controller.prototype.__defineSetter__("session", function(s) { this._session = s });
Controller.prototype.__defineSetter__("request_body", function(b) { this._request_body = b });
