var ib = function() {
  // private variables
  var pieces = { "K": "&#9812;"
               , "Q": "&#9813;"
               , "R": "&#9814;"
               , "B": "&#9815;"
               , "N": "&#9816;"
               , "P": "&#9817;"
               , "k": "&#9818;"
               , "q": "&#9819;"
               , "r": "&#9820;"
               , "b": "&#9821;"
               , "n": "&#9822;"
               , "p": "&#9823;"
               };

  var fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  var board = "";

  // public methods
  return {
    play : function() {
      join();
      $('#welcome').remove();
      $('#primary > .board').html(fen2board(fen));
    }
  };

  // private methods
  function join() {

  };

  function fen2board(fen) {
    var position = fen.split(' ')[0],
        line = 0,
        sq = 0,
        board = '';

    for (var i = 0, l = position.length; i < l; i++) {
      var char = position.charAt(i);
      if (!isNaN(char)) {
        for (var j = 0; j < char; j++) {
          board += square(((line + sq) % 2 == 0 ? 'light' : 'dark'));
          sq++;
        }
      } else if (char == "/") {
        board += "<div class=\"rank_break\"></div>";
        line++;
      } else {
        board += square(((line + sq) % 2 == 0 ? 'light' : 'dark'), pieces[char]);
        sq++;
      }
    }
    return board;
  }


  function square(color, piece) {
    return "<div class=\"" + color + "_square\">" + (piece ? piece : " &nbsp; ") + "</div>";
  }
}();
