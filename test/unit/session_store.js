var SessionStore = require("./../../lib/session_store");

module.exports = {
  setUp: function(callback) {
    this.session_store = new SessionStore();
    callback();
  },

  generate_key_produces_a_32_byte_string: function(test) {
    test.equal(this.session_store.generate_key().length, 32);
    test.done();
  },

  can_get_a_session_after_create: function(test) {
    var session_id = this.session_store.create();
    test.ok(this.session_store.get(session_id));
    test.done();
  },

  can_destory_a_session: function(test) {
    var session_id = this.session_store.create();
    test.ok(this.session_store.get(session_id));

    this.session_store.destroy(session_id);
    test.equal(this.session_store.get(session_id), undefined);

    test.done();
  },

  can_search_for_data_saved_in_a_session: function(test) {
    var session_id = this.session_store.create();
    var session = this.session_store.get(session_id);

    var secret_key = this.session_store.generate_key();
    var secret_val = this.session_store.generate_key();

    session[secret_key] = secret_val;

    var found = this.session_store.find(function(fnd_session, fnd_session_id) {
      return (fnd_session[secret_key] === secret_val);
    });

    test.equal(found, session);

    test.done();
  }
}
