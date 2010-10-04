  ///////////////////////
 // private variables //
///////////////////////
var clients = {}
  , client_count = 0
  , games = []
  , waiting = [];

var game = function(w, b) {
}

  ////////////////////
 // public methods //
////////////////////
exports.join = function(sid, name) {
  if (waiting.length > 0) {
    var opp = waiting.pop()
      , color = (Math.floor(Math.random()*2) == 0) ? "w" : "b"
      , ret = {}

    add_client(sid, name);

    if (opp == sid) {
      waiting.push(sid);
      return;
    }

    game = (color == "w") ? new_game(sid, opp) : new_game(opp, sid);

    ret["game"] = game;
    ret["opp"] = opp;
    ret[sid] = color;
    ret[opp] = (color == "w") ? "b" : "w";

    return ret;
  } else {
    waiting.push(sid);
    return null;
  }
}

exports.update = function(sid, fen) {
  var game = games[clients[sid].game];

  game.fen = fen;

  // TODO: validate fen changes

  return { opp: (game.w == sid) ? game.b : game.w };
}

  /////////////////////
 // private methods //
/////////////////////
function add_client(sid, name) {
  if (clients[sid]) return;

  clients[sid] = { name: name, game: 0 };
  client_count++;
}

function rm_client(sid) {
  clients[sid] = null;
  client_count--;
}

function new_game(w, b) {
  games.push({ white: w, black: b, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" });
  return games.length - 1;
}

function end_game(index) {
  games.splice(num, 1) = null;
}
