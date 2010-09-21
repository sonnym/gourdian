var ib = function() {
    ///////////////////////
   // private variables //
  ///////////////////////
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
               , "":  "&nbsp;"
               };
  var boards = {};
  var show_moves = true;

    ////////////////////
   // public methods //
  ////////////////////
  return {
    play : function() {
      $.getScript("board.js"
                  , function(data, textStatus) {
                      boards["primary"] = new ib.board();

                      $("#welcome").remove();

                      draw_board("primary");
                    }
                  );
    },
    toggle_show_moves : function(sm) {
      show_moves = sm;
    }
  };

    /////////////////////
   // private methods //
  /////////////////////
  function draw_board(b) {
    $("#" + b + " > .board").html(array2board(b));
    $("#" + b + " > .board > .square > .piece").draggable( { revert: "invalid"
                                                           , start: function(event, ui) {
                                                               $(".ui-droppable").droppable("destroy");
                                                               display_moves("primary", $(ui.helper[0]));
                                                           }
                                                         });
    $("#" + b + " > .meta").removeClass("hidden");
  }

  function array2board(board) {
    var state = boards[board].get_state(),
        line = 0,
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
        valid = boards[board].get_valid_locations(piece_location);

    for (var i = 0, l = valid.length; i < l; i++) {
      $("#" + board + valid[i]).droppable({ tolerance: "fit"
                                          , activeClass: (show_moves) ? "droppable" : ""
                                          , hoverClass: "droppable_hover"
                                          , drop: function(event, ui) {
                                              boards[board].update_state(piece_location, parseInt($(this).attr("id").substring(board.length)));
                                              draw_board(board);
                                            }
                                          });
    }
  }
}();
