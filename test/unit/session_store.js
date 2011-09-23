module.exports = SessionStoreTest = function() {
  Test.call(this);

  var session_store = new SessionStore();

  this.generate_key_produces_a_32_byte_string = function() {
    assert.equal(session_store.generate_key().length, 32);
  }

  this.can_get_a_session_after_create = function() {
    var session_id = session_store.create();
    assert.ok(session_store.get(session_id));
  }
}
inherits(SessionStoreTest, Test);
