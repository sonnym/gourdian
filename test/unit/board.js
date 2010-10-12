var assert = require("assert")
  , board = require("./../../src/board.js")
  , test_board = new Board();

exports.pawn_moves = function() {
  test_board.set_position("8/7p/4K2P/8/4k3/8/8/8 w - - 0 1");

  assert.equal(test_board.get_valid_locations(15).length, 0);
  assert.equal(test_board.get_valid_locations(23).length, 0);

  test_board.set_position("8/8/4K3/pP6/4k3/8/8/8 w - a6 0 1");
  assert.equal(test_board.get_valid_locations(25).length, 2);

  test_board.set_position("8/8/4K3/6Pp/4k3/8/8/8 w - h6 0 1");
  assert.equal(test_board.get_valid_locations(30).length, 2);
}

exports.bishop_moves = function() {
  test_board.set_position("3BB3/8/4K3/8/4k3/8/8/8 w - - 0 1");

  assert.equal(test_board.get_valid_locations(3).length, 7);
  assert.equal(test_board.get_valid_locations(4).length, 7);

  test_board.set_position("8/8/4K3/8/4k3/8/8/3bb3 b - - 0 1");

  assert.equal(test_board.get_valid_locations(59).length, 7);
  assert.equal(test_board.get_valid_locations(60).length, 7);
}

exports.rook_moves = function() {
  test_board.set_position("2K1k3/8/8/8/8/8/8/3R4 w - - 0 1");

  assert.equal(test_board.get_valid_locations(59).length, 14);
}

exports.queen_moves = function() {
  test_board.set_position("8/8/4K3/2Q5/4k3/8/8/8 w - - 0 1");

  assert.equal(test_board.get_valid_locations(26).length, 25);
}

exports.king_moves = function() {
  test_board.set_position("8/8/1K6/8/4k3/8/8/8 w - - 0 1");

  assert.equal(test_board.get_valid_locations(17).length, 8);
  assert.equal(test_board.get_valid_locations(36).length, 8);
}
