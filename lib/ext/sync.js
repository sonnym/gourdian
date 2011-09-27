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
      else process.nextTick(wait);
    })();
  }

  /* wait until a condition is met before running a callback,
   * but perform an alternate action when condition evalauates to false.
   *
   * @param {Function} condition
   * @param {Function} true_cb
   * @param {Function} false_cb
   * @api public
   */
,  wait_for_while: function(condition, true_cb, false_cb) {
    (function wait() {
      if (condition()) true_cb();
      else {
        false_cb();
        process.nextTick(wait);
      }
    })();
  }
};

