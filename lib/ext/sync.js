/* synchronous library */

module.exports = {
  /* wait until a condition is met before running a callback
   *
   * @param {Function} condition
   * @param {Function} cb
   * @api public
   */
  wait_for: function(condition, cb) {
    (function wait() {
      if (condition()) cb();
      else setTimeout(wait, null);
    })();
  }
};

