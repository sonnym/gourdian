exports.context = { board: require("./../../lib/board.js")
                  , test_board: new Board()
                  }

// state updates
exports.fen_updates = function() {
  test_board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  test_board.update_state(52, 36);
  assert.equal(test_board.get_fen(), "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");

  test_board.update_state(10, 26); // sicilian
  assert.equal(test_board.get_fen(), "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2");

  test_board.update_state(62, 45);
  assert.equal(test_board.get_fen(), "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2");
}

exports.update_state_works_identically_with_integer_and_string_input = function() {
  test_board.set_fen("rnbq1bnr/p1pppk2/8/Pp1P4/5ppp/1PN4N/1BP1PPPP/R2QKBR1 b KQkq - 1 11");
  test_board.update_state(7, 31, function(result) {
    assert.equal(result, "complete")
  });

  test_board.set_fen("rnbq1bnr/p1pppk2/8/Pp1P4/5ppp/1PN4N/1BP1PPPP/R2QKBR1 b KQkq - 1 11");
  test_board.update_state("7", "31", function(result) {
    assert.equal(result, "complete")
  });
}

// piece moves
exports.pawn_moves = function() {
  test_board.set_fen("8/7p/4K2P/8/4k3/8/8/8 w - - 0 1");
  assert.equal(test_board.get_valid_locations(15).length, 0);

  test_board.set_fen("8/7p/4K2P/8/4k3/8/8/8 b - - 0 1");
  assert.equal(test_board.get_valid_locations(23).length, 0);

  test_board.set_fen("8/8/4K3/pP6/4k3/8/8/8 w - a6 0 1");
  assert.deepEqual(test_board.get_valid_locations(25).sort(), [16, 17]);

  test_board.set_fen("8/8/4K3/6Pp/4k3/8/8/8 w - h6 0 1");
  assert.deepEqual(test_board.get_valid_locations(30).sort(), [22, 23]);

  test_board.set_fen("4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(36).sort(), [27, 28]);

  // en passant square updating correctly
  test_board.set_fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  test_board.update_state(52, 36);
  assert.deepEqual(test_board.get_valid_locations(11).sort(), [19, 27].sort());

  // disallow moving into check
  test_board.set_fen("8/8/k7/q1P1K3/8/8/8/8 w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(26).length, 0);

  test_board.set_fen("8/q7/k7/2P5/8/4K3/8/8 w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(26).length, 0);
}

exports.knight_moves = function() {
  test_board.set_fen("7k/8/8/8/8/8/8/1N5K w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(57).sort(), [40, 42, 51]);

  test_board.set_fen("7k/8/8/8/N7/8/8/7K w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(32).sort(), [17, 26, 42, 49]);

  // disallow moving into check
  test_board.set_fen("8/3k4/2q5/8/4N3/8/6K1/8 w - - 0 1");
  assert.equal(test_board.get_valid_locations(36).length, 0);
}

exports.bishop_moves = function() {
  test_board.set_fen("3BB3/8/4K3/8/4k3/8/8/8 w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(3).sort(), [10, 12, 17, 21, 24, 30, 39]);
  assert.deepEqual(test_board.get_valid_locations(4).sort(), [11, 13, 18, 22, 25, 31, 32]);

  test_board.set_fen("8/8/4K3/8/4k3/8/8/3bb3 b - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(59).sort(), [31, 32, 38, 41, 45, 50, 52]);
  assert.deepEqual(test_board.get_valid_locations(60).sort(), [24, 33, 39, 42, 46, 51, 53]);

  // capture
  test_board.set_fen("8/8/8/8/8/8/1K1bk3/2B5 w KQkq - 0 1");
  assert.deepEqual(test_board.get_valid_locations(58), [51]);

  test_board.set_fen("8/8/5b2/8/6k1/2B5/1K6/8 w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(42).sort(), [21, 28, 35]);
}

exports.rook_moves = function() {
  test_board.set_fen("2K1k3/8/8/8/8/8/8/3R4 w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(59).sort(), [3, 11, 19, 27, 35, 43, 51, 56, 57, 58, 60, 61, 62, 63].sort());
}

exports.queen_moves = function() {
  test_board.set_fen("8/8/4K3/2Q5/4k3/8/8/8 w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(26).sort(), [2, 5, 8, 10, 12, 17, 18, 19, 24, 25, 27, 28, 29, 30, 31, 33, 34, 35, 40, 42, 44, 50, 53, 58, 62].sort());
}

exports.king_moves = function() {
  test_board.set_fen("8/8/1K6/8/4k3/8/8/8 w - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(17).sort(), [8, 9, 10, 16, 18, 24, 25, 26].sort());

  test_board.set_fen("8/8/1K6/8/4k3/8/8/8 b - - 0 1");
  assert.deepEqual(test_board.get_valid_locations(36).sort(), [27, 28, 29, 35, 37, 43, 44, 45]);

  // diagonal and lateral checks with rook and queen
  test_board.set_fen("8/8/8/1q6/3K1k2/8/8/2r5 w - - 0 1");
  assert.equal(test_board.get_valid_locations(33).length, 0);

  // ability to castle
  test_board.set_fen("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
  assert.equal(test_board.get_valid_locations(60).length, 7);
  test_board.set_fen("r3k2r/8/8/8/8/8/8/4K3 b kq - 0 1");
  assert.equal(test_board.get_valid_locations(4).length, 7);

  // but not through or into check
  test_board.set_fen("4k3/8/8/2q5/8/8/8/R3K2R w KQ - 0 1");
  assert.equal(test_board.get_valid_locations(60).length, 4);
  test_board.set_fen("r3k2r/8/8/5Q2/8/8/8/4K3 b kq - 0 1");
  assert.equal(test_board.get_valid_locations(4).length, 2);
}
