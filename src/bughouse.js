  ///////////////////////
 // private variables //
///////////////////////
var log = require("./log")
  , sys = require("sys")

  , clients = {}
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
      , color = (Math.floor(Math.random() * 2) == 0) ? "w" : "b"
      , ret = {}

    add_client(sid, name);

    if (opp == sid) {
      waiting.push(sid);
      return;
    }

    game = (color == "w") ? new_game(sid, opp) : new_game(opp, sid);

    ret.game = game;
    ret.opp = opp;
    ret[sid] = color;

    return ret;
  } else {
    add_client(sid, name);
    waiting.push(sid);

    return null;
  }
}

exports.update = function(sid, fen) {
  log.debug(client_count + " current clients: " + sys.inspect(clients));

  if (!clients[sid]) return; // client disconnected during an update

  var game_id = clients[sid].game
    , game = games[game_id]
    , opp_id = (game.white == sid) ? game.black : game.white;

  game.fen = fen;

  // TODO: validate fen changes

  return { game: game_id, opp_id: opp_id }
}

exports.quit = function(sid) {
  var client = clients[sid]
    , game_id = client.game
    , data = null;

  if (game_id > 0) {
    data = { game: game_id, opp_id: ((game.white == sid) ? game.black : game.white) };
    rm_game(game_id);
  }

  rm_client(sid);
  return data;
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
  delete clients[sid];
  client_count--;
}

function new_game(w, b) {
  games.push({ white: w, black: b, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" });
  w.game = b.game = games.length - 1;

  return games.length - 1;
}

function rm_game(index) {
  games.splice(num, 1) = null;
}
