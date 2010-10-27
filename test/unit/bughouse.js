var assert = require("assert")
  , loc = "./../../src/bughouse.js"
  , bughouse = require(loc);

exports.one_can_join = function() {
  bughouse = require(loc);
  assert.equal(bughouse.join("sid0", "client0"), null);
}

exports.two_make_a_game = function() {
  bughouse = require(loc);
  assert.equal(bughouse.join("sid0", "client0"), null);

  var response = bughouse.join("sid1", "client1");
  assert.equal(response["opp"], "sid0");
  assert.ok(response["sid1"]);
  assert.ok(response.states);
  assert.ok(response.states.c);

  assert.ok(!(response.states.l && response.states.r));
}

exports.piece_carry_over = function() {
  var response, sid_1_w, sid_1_b, sid_2_w, sid_2_b;

  bughouse = require(loc);

  // game 1
  assert.equal(bughouse.join("sid0", "client0"), null);

  response = bughouse.join("sid1", "client1");
  assert.equal(response["opp"], "sid0");
  assert.ok(response["sid1"]);
  assert.ok(response.states);
  assert.ok(response.states.c);

  assert.ok(!(response.states.l && response.states.r));

  if (response["sid1"] == "w") {
    sid_1_w = "sid1";
    sid_1_b = "sid0";
  } else {
    sid_1_w = "sid0";
    sid_1_b = "sid1";
  }

  // game 2
  assert.equal(bughouse.join("sid2", "client2"), null);

  response = bughouse.join("sid3", "client3");
  assert.equal(response["opp"], "sid2");
  assert.ok(response["sid3"]);
  assert.ok(response["states"]);
  assert.ok(response["states"]["c"]);

  assert.ok(response["states"]["l"] || response["states"]["r"]);

  if (response["sid3"] == "w") {
    sid_2_w = "sid3";
    sid_2_b = "sid2";
  } else {
    sid_2_w = "sid2";
    sid_2_b = "sid3";
  }

  // capture => 1. e4 d5 2. exd
  bughouse.update(sid_1_w, 52, 36);
  bughouse.update(sid_1_b, 11, 27);
  bughouse.update(sid_1_w, 36, 27);

  bughouse.update(sid_2_w, 52, 36, function(result) {
    assert.equal(result.state.s_b, "p");
  });

  // again for wrap around
  bughouse.update(sid_2_b, 11, 27);
  bughouse.update(sid_2_w, 36, 27);

  bughouse.update(sid_1_b, 8, 16, function(result) {
    assert.equal(result.state.s_b, "p");
  });
}
