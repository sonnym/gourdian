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
      $.extend(pieces, black_pieces, white_pieces, {"": "&nbsp;"});

      fen2array();

      $("#welcome").remove();

      draw_board("primary");
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

  // returns array of valid array positions
  function valid_locations(board, start) {
    var valid = [],
        fen_parts = fen.split(" "),
        turn = fen_parts[1],
        castle = fen_parts[2],
        en_passant = fen_parts[3],
        piece = state[start];

    if (piece == "" || (turn == "w" && !in_array(piece, $.keys(white_pieces))) || turn == "b" && !in_array(piece, $.keys(black_pieces))) return [];

    if (piece == "p") {
      valid.push(start + 8);
      if (start > 7 && start < 16) valid.push(start + 16);
    } else if (piece == "P") {
      valid.push(start - 8);
      if (start > 47 && start < 56) valid.push(start - 16);
    } else if (piece == "B" || piece == "b") {
      valid = mult_check(turn, start, [7, 9]);
    } else if (piece == "N" || piece == "n") {
      $.merge(valid, $.merge(mult_check(turn, start, [6, 10], 1, 1), mult_check(turn, start, [15, 17], 1, 2)));
    } else if (piece == "R" || piece == "r") {
      valid = mult_check(turn, start, [1, 8]);
    } else if (piece == "Q" || piece == "q") {
      $.merge(valid, mult_check(turn, start, [1, 7, 8, 9]));
    } else if (piece == "K" || piece == "k") {
      valid = mult_check(turn, start, [1, 7, 8, 9], 1);
    }

    return valid;
  }

  // returns valid indices from the board array to which a piece can move
  // takes into account the need for a knight to travel multiple ranks in a given move,
  // blokcing by other pieces, en prise for any move with a regular pattern
  // mult here stands for multiplicative since, by default, the search will search at all multiples of a distance within array bounds
  function mult_check(turn, start, distances, depth, wrap) {
    var valid = [],
        iter = (start < 31) ? function(cur, dist) { return start + (dist * cur) < 64; } : function(cur, dist) { return start - (dist * cur) >= 0; };

    for (var d in distances) {
      var distance = distances[d],
          blocked = [false, false],
          current = 1;

      do {
        // traversing an array
        var indices = [start + (distance * current), start - (distance * current)];

        for (var i in indices) {
          var index = indices[i];

          if (index < 64 && index >= 0 && !blocked[i]) {
            // ensure minimum number of wraps => essential for knights
            if (wrap && Math.abs(position2rank(start) - position2rank(index)) != wrap) continue;

            var piece_in_target = state[index];

            if (!piece_in_target) valid.push(index);
            else  {
              blocked[i] = true;

              // allow capture on first block
              if (!(turn == "w" && in_array(piece_in_target, $.keys(white_pieces)) || turn == "b" && in_array(piece_in_target, $.keys(black_pieces)))) valid.push(index);
            }

            // if distance == 8 => traversing board file; ignore wrapping conditions
            if (!wrap && distance != 8 && (index % 8 == 0 || (index + 1) % 8 == 0)) blocked[i] = true;
          }
        }

        current++;
      } while(iter(current, distance) && (!depth || current <= depth))
    }

    return valid;
  }

  function position2rank(p) {
    return Math.floor(p / 8) + 1;
  }

  function position2file(p) {
    return String.fromCharCode(97 + (p % 8));
  }

  function update_state(board, from, to) {
    var piece = state[from],
        valid = valid_locations(board, from),
        capture = (to != "");

    if (in_array(to, valid)) {
      state[to] = piece;
      state[from] = "";

      // updating fen is also dependent upon valid drop
      var fen_parts = fen.split(" ");

      fen_parts[0] = array2fen();                                                                                                                               // position
      fen_parts[1] = (fen_parts[1] == "w") ? "b" : "w";                                                                                                        // turn
      if (fen_parts[2] != "-" && in_array(piece, ["R", "r", "K", "k"])) {                                                                                     // castle
        if (piece == "k") fen_parts[2].replace(/[kq]/g, "");
        else if (piece == "K") fen_parts[2].replace(/[KQ]/g, "");
        else if (piece == "r") {
          if (from == 0) fen_parts[2].replace(/[q]/g, "");
          else if (from == 7) fen_parts[2].replace(/[k]/g, "");
        } else if (piece == "R") {
          if (from == 56) fen_parts[2].replace(/[Q]/g, "");
          else if (from == 63) fen_parts[2].replace(/[K]/g, "");
        }

        if (fen_parts[2].length == 0) fen_parts[2] = "-";
      }
      fen_parts[3] = (in_array(piece, ["p", "P"]) && Math.abs(from - to) == 16) ? position2file(from) + position2rank(Math.min(from, to) + 8) : "-"; // en passant
      fen_parts[4] = (in_array(piece, ["p", "P"]) || capture) ? 0 : fen_parts[4] + 1;                                                               // half move number
      if (fen_parts[1] == "w") fen_parts[5]++;                                                                                                     // full move number

      fen = fen_parts.join(" ");
    }
  }

  function array2fen() {
    var ret = "";

    for (var i = 0, l = state.length; i < l; i++) {
      var piece = state[i];

      if (i > 0 && i % 8 == 0) ret += '/';

      if (piece == "") {
        var count = 1;
        for (; state[i + 1] == "" && (i + 1) % 8 != 0; count++) i++;
        ret += parseInt(count);
      } else ret += piece;
    }

    return ret;
  }

   // display methods
  ///////////////////
  function draw_board(b) {
    $("#" + b + " > .board").html(array2board(b));

    $("#" + b + " > .board > .square > .piece").draggable( { revert: "invalid"
                                                           , start: function(event, ui) {
                                                               $(".ui-droppable").droppable("destroy");
                                                               display_moves("primary", $(ui.helper[0]));
                                                           }
                                                         });
  }

  function array2board(board) {
    var line = 0,
        ret = "";

    for (var i = 0, l = state.length; i < l; i++) {
      if (i % 8 == 0) {
        ret += "<div class=\"rank_break\"></div>";
        line++;
      }
      ret += board_square((((i + line + 1 % 2) % 2 == 0) ? 'light' : 'dark'), board + i.toString(), state[i]);
    }

    return ret;
  }

  function board_square(color, id, piece) {
    if (piece == "") return "<div class=\"square " + color + "\" id=\"" + id + "\">&nbsp;</div>";
    else return "<div class=\"square " + color + "\" id=\"" + id + "\"><div class=\"piece\">" + pieces[piece] + "<span class=\"hidden\">" + piece + "</span></div></div>";
  }

  function display_moves(board, piece) {
    var piece_location = parseInt(piece.parent()[0].id.substring(board.length)),
        valid = valid_locations(board, piece_location);

    for (var i = 0, l = valid.length; i < l; i++) {
      $("#" + board + valid[i]).droppable({ tolerance: "fit"
                                          , activeClass: "droppable"
                                          , hoverClass:  "droppable_hover"
                                          , drop: function(event, ui) {
                                              update_state(board, piece_location, $(this).attr("id").substring(board.length));
                                              draw_board(board);
                                            }
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
