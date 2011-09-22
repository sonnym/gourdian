/* synchronous library */

module.exports = {
  /* wait until a condition is met before running a callback
   *
   * @param {Function} condition
   * @param {Function} cb
   * @param {Integer} timeout (optional)
   * @api public
   */
  wait_for: function(condition, cb, timeout) {
    (function wait() {
      if (condition()) cb();
      else setTimeout(wait, timeout ? timeout : null);
    })();
  }
};

