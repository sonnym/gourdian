var crypto = require("crypto");
var _ = require("underscore");

/* constructor */
var SessionStore = module.exports = function() {
  this._sessions = {};
}

/* @returns {Object} */
SessionStore.prototype.__defineGetter__("sessions", function() {
  return this._sessions
});

/* create a new session
 *
 * @param {String} [key] optional reference to session key
 * @returns {String} session key
 * @api public
 */
SessionStore.prototype.create = function(key) {
  if (!key) key = this.generate_key();

  if (this.get(key)) throw "KEYCOLLISION";

  this._sessions[key] = {};
  return key;
}

/* get a session object
 *
 * @param {String} key
 * @returns {Object} session
 * @api public
 */
SessionStore.prototype.get = function(key) {
  return this._sessions[key];
}

/* search for a session
 *
 * returns the first session object that causes
 * detector to evalaute true
 *
 * @param {Function} detector
 * @returns {Object} session
 * @api public
 */
SessionStore.prototype.find = function(detector) {
  return _.detect(this._sessions, detector);
}

/* destroy a session object
 *
 * @param {String} key
 * @api public
 */
SessionStore.prototype.destroy = function(key) {
  try {
  if (this._sessions[key]) delete this._sessions[key];
  } catch(e) { console.log(e) }
}

/* @api private */
SessionStore.prototype.generate_key = function() {
  var hash = crypto.createHash("md5")
    , time = (new Date()).getTime()
    , salted_time = time + "" + Math.random();

   hash.update(salted_time);
   return hash.digest("hex");
}
