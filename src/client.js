var ib = (function() {
  DEBUG = true;

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
    , black_pieces = { "k": "&#9818;"
                     , "q": "&#9819;"
                     , "r": "&#9820;"
                     , "b": "&#9821;"
                     , "n": "&#9822;"
                     , "p": "&#9823;"
                     }
    , pieces = {}
    , boards = { "l" : { flipped: true, gid: null, obj: null } // flipped with respect to fen
               , "c" : { flipped: false, gid: null, obj: null }
               , "r" : { flipped: true, gid: null, obj: null }
               }
    , name = null
    , color = null
    , selected = null
    , show_moves = true
    , promotion_piece = null

    , socket = null;

    ////////////////////
   // public methods //
  ////////////////////
  return {
    play : function() {
      init("join");
    }
  , kibitz : function() {
      init("kibitz");
    }
  , toggle_show_moves : function(sm) {
      show_moves = sm;
      $(".droppable").removeClass("droppable");
    }
  , toggle_flip_board : function() {
      boards["l"].flipped = boards["r"].flipped = boards["c"].flipped;
      boards["c"].flipped = !boards["c"].flipped;

      draw_boards();
    }
  , toggle_promotion_piece : function(piece) {
      if (promotion_piece) $("#promotion_piece" + promotion_piece).removeClass("promotion_piece_selected");
      $("#promotion_piece" + piece).addClass("promotion_piece_selected");

      promotion_piece = piece;
    }
  , redraw_boards : function() {
      draw_boards();
    }
  };

    /////////////////////
   // private methods //
  /////////////////////

  // initial state

  function init(action) {
    // add ability to get keys from objects
    // http://snipplr.com/view/10430/jquery-object-keys/ => https://groups.google.com/group/jquery-en/browse_thread/thread/3d35ff16671f87a2%5C
    $.extend({ keys: function(obj) {
                       var a = [];
                       $.each(obj, function(k) { a.push(k) });
                       return a;
                     }
            });

    $.extend(pieces, black_pieces, white_pieces, {"": "&nbsp;"});

    // board is required first
    load_js("board.js", function() {
      // create and display
      for (var b in boards) boards[b].obj = new Board();
      $("#welcome").remove();

      draw_boards();

      // set name
      name = $("#name").val();
      if (!name) name = "anonymous";

      // open socket
      load_js("lib/socket.io.js", function() {
        socket = new io.Socket(null, {port: 8124});
        socket.connect();

        socket.send({ action: action, data: { name: name } });

        socket.on("message", function(data) {
          if (DEBUG) console.log(data);

          // hold
          if (data.hold) {
            show_hold_dialog();
          }

          // join response/color assignment
          if (data.color) {
            color = data.color;

            if (data.color == "b") {
              toggle_flip_board();
              draw_boards();
            }

            var hold = $("#hold");
            hold.dialog("destroy");
            hold.addClass("hidden");
          }

          // kibitz set up
          if (data.kibitz) {
            for (var b in boards) {
              boards[b].gid = data.states[b].gid;
              boards[b].obj.set_fen(data.states[b].fen, function(message) {
                if (message == "converted") draw_board(b);
              });
            }
          }

          // position update
          if (data.fen) {
            for (var b in boards) {
              if (boards[b].gid == data.gid) {
                boards[b].obj.set_fen(data.fen, function(message) {
                  if (message == "converted") draw_board(b);
                });
              }
            }
          }
        });
      });
    });
  }

  function load_js(file, callback) {
    if (DEBUG) {
      var f = document.createElement("script");
      f.setAttribute("type","text/javascript");
      f.setAttribute("src", file);
      document.getElementsByTagName("head")[0].appendChild(f)

      if (callback) setTimeout(callback, 1000);
    } else $.getScript(file, function(data, textStatus) {
                               if (callback) callback();
                             });
  }

  // display functions

  function draw_boards() {
    for (var b in boards) draw_board(b);
  }

  function draw_board(b) {
    $("#" + b + " > .board").html(array2board(b));
    $("#" + b + " > .meta").removeClass("hidden");

    // no need for periphal boards to have draggable overhead . . .
    if (b != "c") return;

    var pieces = $("#" + b + " > .board > .square > .piece")
    pieces.each(function(i, e) {
      // . . . or when held or for oponent's pieces
      if (get_color_from_piece_div($(pieces[i])) == color) {
        $(this).draggable({ revert: "invalid"
                           , start: function(event, ui) {
                               $(".ui-droppable").droppable("destroy");
                               display_moves("c", $(ui.helper[0]), "drag");
                           }
                          });
        $(this).click(function() {
          $(".selected").removeClass("selected");
          $(".droppable").removeClass("droppable");

          var square = $(this).parent().attr("id");
          if (square == selected) selected = null;
          else {
            $(this).parent().addClass("selected");
            selected = square;
            display_moves("c", $(this), "click");
          }
        });
      }
    });
  }

  function array2board(b) {
    var state = boards[b].obj.get_state()
      , line = 0
      , ret = "";

    // since the index of the square acts as an id, simply state.reverse()ing alters the *position* of the pieces,
    // hence the following:  dirty, but operational
    if (!boards[b].flipped) {
      for (var i = 0, l = state.length; i < l; i++) {
        if (i % 8 == 0) {
          ret += "<div class=\"rank_break\"></div>";
          line++;
        }
        ret += board_square((((i + line + 1 % 2) % 2 == 0) ? 'light' : 'dark'), b + i.toString(), state[i]);
      }
    } else {
      for (var i = state.length - 1; i >= 0; i--) {
        ret += board_square((((i + line + 1 % 2) % 2 == 0) ? 'light' : 'dark'), b + i.toString(), state[i]);
        if (i % 8 == 0 && i != 0) {
          ret += "<div class=\"rank_break\"></div>";
          line++;
        }
      }
    }

    // add extra rank_break at the end of the board to fix styles
    return ret += "<div class=\"rank_break\"></div>";
  }

  function board_square(color, id, piece) {
    if (piece == "") return "<div class=\"square " + color + "\" id=\"" + id + "\">&nbsp;</div>";
    else return "<div class=\"square " + color + "\" id=\"" + id + "\"><div class=\"piece\">" + pieces[piece] + "<span class=\"hidden\">" + piece + "</span></div></div>";
  }

  function display_moves(board, piece, method) {
    var piece_location = get_location_from_piece_div(board, piece)
      , valid = boards[board].obj.get_valid_locations(piece_location)
      , turn = get_color_from_piece_div(piece);

    if (!DEBUG && turn != color) return;

    for (var i = 0, l = valid.length; i < l; i++) {
      var square = $("#" + board + valid[i]);

      if (method == "drag") {
        square.droppable({ tolerance: "fit"
                         , activeClass: (show_moves) ? "droppable" : ""
                         , hoverClass: "selected"
                         , drop: function(event, ui) { register_move(board, piece_location, $(this), turn) }
                         });
      } else if (method == "click") {
        if (show_moves) square.addClass("droppable");
        square.click(function() {
          if (selected) register_move(board, piece_location, $(this), turn);
        });
      }
    }
  }

  function register_move(b, from, to, t) {
    boards[b].obj.update_state( from
                              , parseInt(to.attr("id").substring(b.length))
                              , function(message, callback) {
                                  if (message == "promote") display_promotion_dialog(t, callback);
                                  else if (message == "complete") {
                                    draw_board(b);
                                    socket.send({ action: "pos", data: { fen: boards["c"].obj.get_fen() } });
                                  }
                                }
                              );
  }

  function show_hold_dialog() {
    $("#hold").dialog({ autoOpen: true
                      , closeText: ""
                      , draggable: false
                      , modal: true
                      , title: "Please Hold"
                      , open: function(event, ui) {
                         $(this).removeClass("hidden");
                        }
                      });
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
                               if (!promotion_piece) return false;
                             }
                           , close: function(event, ui) {
                               callback(promotion_piece);
                               promotion_piece = null;

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

  function get_color_from_piece_div(d) {
    var ascii = d.children().first().html().charCodeAt(0);
    return (ascii > 64 && ascii < 91) ? "w" : (ascii > 96 && ascii < 123) ? "b" : null;
  }
})();
