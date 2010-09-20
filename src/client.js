var ib = function() {
    ///////////////////////
   // private variables //
  ///////////////////////
  var white_pieces = { "K": "&#9812;"
                     , "Q": "&#9813;"
                     , "R": "&#9814;"
                     , "B": "&#9815;"
                     , "N": "&#9816;"
                     , "P": "&#9817;"
                     };
  var black_pieces = { "k": "&#9818;"
                     , "q": "&#9819;"
                     , "r": "&#9820;"
                     , "b": "&#9821;"
                     , "n": "&#9822;"
                     , "p": "&#9823;"
                     };
  var pieces = {};
  $.extend(pieces, black_pieces, white_pieces, {"": "&nbsp;"});

  var fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  var state = [];

  // http://snipplr.com/view/10430/jquery-object-keys/ => https://groups.google.com/group/jquery-en/browse_thread/thread/3d35ff16671f87a2%5C
  $.extend({
    keys: function(obj) {
      var a = [];
      $.each(obj, function(k) { a.push(k) });
      return a;
    }
  });

    ////////////////////
   // public methods //
  ////////////////////
  return {
    play : function() {
      fen2array();

      $("#welcome").remove();
      $("#primary > .board").html(array2board("primary"));

      $(".piece").draggable({ revert: "invalid" });

      $(".piece").bind("dragstart", function(event, ui) {
        $(".ui-droppable").droppable("destroy");
        display_moves("primary", $(ui.helper[0]));
      });

      $(".piece").bind("dragstop", function(event, ui) {
        $(".ui-droppable").disabled = true;
      });
    }
  };

    /////////////////////
   // private methods //
  /////////////////////

   // chess methods
  /////////////////
  function fen2array() {
    var position = fen.split(" ")[0].replace(/\//g, ""),
        offset = 0;

    for (var i = 0, l = position.length; i < l; i++) {
      var char = position.charAt(i);

      if (isNaN(char)) state[i + offset] = char;
      else for (var j = 0; j < char; j++) state[i + ((j == char - 1) ? offset : offset++)] = "";
    }
  }

  function validate(board, piece, square) {
    return in_array(square, valid_locations(board, piece));
  }

  // returns array of valid array positions
  function valid_locations(board, p) {
    var valid = [],
        fen_parts = fen.split(" "),
        turn = fen_parts[1],
        castle = fen_parts[2],
        en_passant = fen_parts[3],
        piece = p.context.lastElementChild.innerHTML;

    if ((turn == "w" && !in_array(piece, $.keys(white_pieces))) || turn == "b" && !in_array(piece, $.keys(black_pieces))) return [];

    var start = parseInt(p.parent()[0].id.substring(board.length));

    if (piece == "p") {
      valid.push(start + 8);
      if (start > 7 && start < 16) valid.push(start + 16);
    } else if (piece == "P") {
      valid.push(start - 8);
      if (start > 47 && start < 56) valid.push(start - 16);
    } else if (piece == "B" || piece == "b") {
      valid = wrap_mult_check(board, turn, start, [7, 9]);
    } else if (piece == "N" || piece == "n") {
      $.merge(valid, wrap_mult_check(board, turn, start, [6, 10], 1, 1), wrap_multi_check(board, turn, start, [15, 17], 1, 2));
    } else if (piece == "R" || piece == "r") {
      valid = wrap_mult_check(board, turn, start, [1, 8]);
    } else if (piece == "Q" || piece == "q") {
      $.merge(valid, wrap_mult_check(board, turn, start, [1, 7, 8, 9]));
    } else if (piece == "K" || piece == "k") {
      valid = wrap_mult_check(board, turn, start, [1, 7, 8, 9], 1);
    }

    return valid;
  }

  // gives valid positions for multiples, neglects left and right board edges
  function wrap_mult_check(board, turn, start, distances, depth, wrap) {
    var valid = [],
        iter = (start < 31) ? function(cur, dist) { return start + (dist * cur) < 64; } : function(cur, dist) { return start - (dist * cur) >= 0; };

    for (var d in distances) {
      var distance = distances[d],
          blocked = [false, false],
          current = 1;

      do {
        var indices = [start + (distance * current), start - (distance * current)];

        for (var i in indices) {
          var index = indices[i];

          if (index < 64 && index >= 0 && !blocked[i]) {
            var piece = state[index];

            if (!piece) valid.push(index);
            else  {
              blocked[i] = true;

              // allow capture on first block
              if (!(turn == "w" && in_array(piece, $.keys(white_pieces)) || turn == "b" && in_array(piece, $.keys(black_pieces)))) valid.push(index);
            }

            // if distance == 8 => traversing file; ignore wrapping conditions
            if (!wrap && distance != 8 && (index % 8 == 0 || (index + 1) % 8 == 0)) blocked[i] = true;
          }
        }

        current++;
      } while(iter(current, distance) && (!depth || current <= depth))
    }

    return valid;
  }

  function array2fen() { }

   // display methods
  ///////////////////
  function array2board(board) {
    var line = 0,
        ret = "";

    for (var i = 0, l = state.length; i < l; i++) {
      if (i % 8 == 0) {
        ret += "<div class=\"rank_break\"></div>";
        line++;
      }
      ret += board_square((((i + line % 2) % 2 == 0) ? 'light' : 'dark'), board + i.toString(), state[i]);
    }

    return ret;
  }

  function board_square(color, id, piece) {
    if (piece == "") return "<div class=\"square " + color + "\" id=\"" + id + "\">&nbsp;</div>";
    else return "<div class=\"square " + color + "\" id=\"" + id + "\"><div class=\"piece\">" + pieces[piece] + "<span class=\"hidden\">" + piece + "</span></div></div>";
  }

  function display_moves(board, piece) {
    var valid = valid_locations(board, piece);

    for (var i = 0, l = valid.length; i < l; i++) {
      $("#" + board + valid[i]).droppable({ tolerance: "fit"
                                          , activeClass: "droppable"
                                          , hoverClass:  "droppable_hover"
      });
    }
  }

   // misc
  ////////
  function in_array(needle, haystack) {
    return $.grep(haystack, function(e, i) {
      return e == needle;
    }).length > 0;
  }
}();
