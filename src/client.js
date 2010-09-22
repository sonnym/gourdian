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
                     }
  var black_pieces = { "k": "&#9818;"
                     , "q": "&#9819;"
                     , "r": "&#9820;"
                     , "b": "&#9821;"
                     , "n": "&#9822;"
                     , "p": "&#9823;"
                     }
    , pieces = {}
    , boards = {}
    , show_moves = true
    , flipped = false   // with respect to fen
    , promotion_piece = ""
    , DEBUG = false;

    ////////////////////
   // public methods //
  ////////////////////
  return {
    play : function() {
      // http://snipplr.com/view/10430/jquery-object-keys/ => https://groups.google.com/group/jquery-en/browse_thread/thread/3d35ff16671f87a2%5C
      $.extend({ keys: function(obj) {
                   var a = [];
                   $.each(obj, function(k) { a.push(k) });
                   return a;
                 }
              });
      $.extend(pieces, black_pieces, white_pieces, {"": "&nbsp;"});

      if (DEBUG) {
        var f = document.createElement("script");
        f.setAttribute("type","text/javascript");
        f.setAttribute("src", "board.js");
        document.getElementsByTagName("head")[0].appendChild(f)

        init();
      } else $.getScript("board.js", function(data, textStatus) { init(); });
    }
  , toggle_show_moves : function(sm) {
        show_moves = sm;
      }
  , toggle_flip_board : function() {
      flipped = !flipped;
      draw_board("primary");
    }
  , toggle_promotion_piece : function(piece) {
      if (promotion_piece) $("#promotion_piece" + promotion_piece).removeClass("promotion_piece_selected");
      $("#promotion_piece" + piece).addClass("promotion_piece_selected");
      promotion_piece = piece;
    }
  };

    /////////////////////
   // private methods //
  /////////////////////

  function init() {
    boards["primary"] = new ib.board();
    $("#welcome").remove();
    draw_board("primary");
  }

  // display functions

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
    var state = boards[board].get_state()
      , line = 0
      , ret = "";

    // since the index of the square acts as an id, simply state.reverse()ing alters the *position* of the pieces,
    // hence the following:  dirty, but operational
    if (!flipped) {
      for (var i = 0, l = state.length; i < l; i++) {
        if (i % 8 == 0) {
          ret += "<div class=\"rank_break\"></div>";
          line++;
        }
        ret += board_square((((i + line + 1 % 2) % 2 == 0) ? 'light' : 'dark'), board + i.toString(), state[i]);
      }
    } else {
      for (var i = state.length - 1; i >= 0; i--) {
        ret += board_square((((i + line + 1 % 2) % 2 == 0) ? 'light' : 'dark'), board + i.toString(), state[i]);
        if (i % 8 == 0) {
          ret += "<div class=\"rank_break\"></div>";
          line++;
        }
      }
    }

    return ret;
  }

  function board_square(color, id, piece) {
    if (piece == "") return "<div class=\"square " + color + "\" id=\"" + id + "\">&nbsp;</div>";
    else return "<div class=\"square " + color + "\" id=\"" + id + "\"><div class=\"piece\">" + pieces[piece] + "<span class=\"hidden\">" + piece + "</span></div></div>";
  }

  function display_moves(board, piece) {
    var piece_location = get_location_from_piece_div(board, piece)
      , valid = boards[board].get_valid_locations(piece_location)
      , turn = get_turn_from_piece_div(piece);

    for (var i = 0, l = valid.length; i < l; i++) {
      $("#" + board + valid[i]).droppable({ tolerance: "fit"
                                          , activeClass: (show_moves) ? "droppable" : ""
                                          , hoverClass: "droppable_hover"
                                          , drop: function(event, ui) {
                                              boards[board].update_state(piece_location
                                                                        , parseInt($(this).attr("id").substring(board.length))
                                                                        , function(message, callback) {
                                                                            if (message == "promote") display_promotion_dialog(turn, callback);
                                                                            else if (message == "complete") {
                                                                              draw_board(board);
                                                                            }
                                                                          }
                                                                        );
                                            }
                                          });
    }
  }

  function display_promotion_dialog(turn, callback) {
    $("#promotion").dialog({ autoOpen: true
                           , closeOnEscape: false
                           , closeText: ""
                           , draggable: false
                           , modal: true
                           , title: "Select a Piece"
                           , buttons: { "Ok": function() { $(this).dialog("close"); } }
                           , open: function(event, ui) {
                              $(this).html(get_promotion_pieces(turn));
                              $(this).removeClass("hidden");
                             }
                           , beforeClose: function(event, ui) {
                               if (promotion_piece == "") return false;
                             }
                           , close: function(event, ui) {
                               callback(promotion_piece);
                               $(this).addClass("hidden");
                               $(this).dialog("destroy");
                             }
                           });
  }

  function get_promotion_pieces(turn) {
    var pieces = (turn == "w") ? white_pieces : black_pieces
      , piece_keys = $.keys(pieces)
      , ret = "";

    for (var p in piece_keys) {
      var piece = piece_keys[p];
      if (piece.toLowerCase() != "p" && piece.toLowerCase() != "k") ret += "<div class=\"promotion_piece\" id=\"promotion_piece" + piece + "\" onclick=\"ib.toggle_promotion_piece('" + piece + "');\">" + pieces[piece] + "</div>";
    }

    return ret;
  }

  function get_location_from_piece_div(board, d) {
    return parseInt(d.parent()[0].id.substring(board.length));
  }

  function get_turn_from_piece_div(d) {
    var ascii = d.children().first().html().charCodeAt(0);
    return (ascii > 64 && ascii < 91) ? "w" : (ascii > 96 && ascii < 123) ? "b" : null;
  }
}();
