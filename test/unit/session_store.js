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

  this.can_destory_a_session = function() {
    var session_id = session_store.create();
    assert.ok(session_store.get(session_id));

    session_store.destroy(session_id);
    assert.equal(session_store.get(session_id), undefined);
  }
}
inherits(SessionStoreTest, Test);
