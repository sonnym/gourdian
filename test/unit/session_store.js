module.exports = SessionStoreTest = function() {
  Test.call(this);

  var session_store = new SessionStore();

  this.generate_key_produces_a_32_byte_string = function() {
    assert.equal(session_store.generate_key().length, 32);
  }
}
inherits(SessionStoreTest, Test);
