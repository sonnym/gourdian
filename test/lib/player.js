TMPDIR = "/tmp";

var board = require("./../../src/board") 
  , log = require("./../../src/log");

exports.move = function(fen, callback) {
  // setup
  var board = new Board();
  if (fen) board.set_position(fen);

  // get possible
  var turn = board.get_turn()
    , state = board.get_state()
    , piece_moves = {}
    , pieces = 0
    , piece_finder = function(color, piece) {
        var ascii = piece.charCodeAt(0);
        return piece != "" && ((color == "w" &&  ascii > 64 && ascii < 91) || (color == "b" && ascii > 96 && ascii < 123)) ? true : false;
      };

  for (var i = 0, l = state.length; i < l; i++) {
    var piece = state[i];
    if (piece_finder(turn, piece)) {
      var valid = board.get_valid_locations(i);
      if (valid.length > 0) {
        piece_moves[i] = valid;
        pieces++;
      }
    }
  }

  // select
  if (pieces > 0) {
    var count = 0
      , from = null
      , to = null
      , moves = null;

    // select random piece to move
    // http://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
    for (var piece in piece_moves) if (Math.random() < 1/++count) {
      from = piece;
      moves = piece_moves[piece];
    }

    to = moves[Math.floor(Math.random() * moves.length)];
  }

  callback(from, to);
}
