  ///////////////////////
 // private variables //
///////////////////////
var log = require("./log")
  , crypto = require("crypto")
  , sys = require("sys")

  , hash = function(d) { return crypto.createHash("sha1").update(d).digest("hex") }

  , clients = {}
  , client_count = 0
  , waiting = [];

// linked list with lookup via hash key
var games = (function() {
  var length = 0
    , nodes = {}
    , head = null
    , tail = null;

  return {
    new : function(w, b) {
      var game = hash(w + b);

      nodes[game] = { next: null
                    , prev: null
                    , data:
                       { state: { white: w, black: b, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", stash_w: null, stash_b: null }
                       , watchers: []
                       }
                    };

      if (length == 0) {
        this.head = nodes[game];
        this.tail = nodes[game];
      } else {
        this.tail.next = nodes[game];
        this.tail = nodes[game];
      }

      this.length++;

      return game;
    }
  , update : function(game, sid, fen) {
      nodes[game].data.state.fen = fen;

      var w = nodes[game].data.state.white
        , b = nodes[game].data.state.black;

      return (sid == w) ? b : w;
    }
  , rm : function(game) {
      var node = nodes[game];

      if (node == null) return; // opponent already quit

      if (node.next == null) {
        this.tail = node.prev;
      } else if (node.prev == null) {
          this.head = node.next
      } else {
        node.prev.next = node.next
        node.next.prev = node.prev
      }

      delete nodes[game];
      length--;
    }
  , length : function() {
     return this.length
    }
  }
})();

  ////////////////////
 // public methods //
////////////////////
exports.join = function(sid, name) {
  if (!clients[sid]) add_client(sid, name);

  if (waiting.length > 0) {
    var opp = waiting.pop()
      , color = (Math.floor(Math.random() * 2) == 0) ? "w" : "b"
      , ret = {}

    if (opp == sid) {
      waiting.push(sid); // get back in line
      return;
    }

    var game = (color == "w") ? games.new(sid, opp) : games.new(opp, sid);
    clients[sid].game = clients[opp].game = game;

    log.info("game " + game + " created for " + sid + " and " + opp);

    ret.game = game;
    ret.opp = opp;
    ret[sid] = color;

    return ret;
  } else {
    waiting.push(sid);

    return null;
  }
}

exports.update = function(sid, fen) {
  if (!clients[sid]) return; // client disconnected during an update

  // TODO: validate fen changes

  var game = clients[sid].game
    , opp_id = games.update(game, sid, fen);

  return { game: game, opp_id: opp_id }
}

exports.kibitz = function(sid, name) {
  add_client(sid, name);

  log.info("added client; count: " + parseInt(client_count));

  return Math.floor(Math.random() * games.length);
}

exports.quit = function(sid) {
  var game = clients[sid].game
    , data = null;

  if (game) {
    var opp_id = games.rm(game);
    if (opp_id && clients[opp_id].game) delete clients[opp_id].game; // else opponent already quit

    data = { game: game, opp_id: opp_id };
  }

  client_count--;

  return data;
}

  /////////////////////
 // private methods //
/////////////////////
function add_client(sid, name) {
  if (clients[sid]) return;

  clients[sid] = { name: name };
  client_count++;
}

function rm_client(sid) {
  delete clients[sid];
  client_count--;
}
