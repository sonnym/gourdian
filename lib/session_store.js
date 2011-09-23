module.exports = SessionStore = function() {
  this._sessions = {};
}

SessionStore.prototype.generate_key = function() {
  var hash = crypto.createHash("md5")
    , time = (new Date()).getTime()
    , salted_time = time + "" + Math.random();

   hash.update(salted_time);
   return hash.digest("hex");
}
