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
      var game_id = hash(w + b);

      nodes[game_id] = { next: null
                       , prev: null
                       , id: game_id
                       , data:
                          { state: { white: w, black: b, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", stash_w: null, stash_b: null }
                          , watchers: []
                          }
                       };

      if (length == 0) {
        head = nodes[game_id];
        tail = nodes[game_id];
      } else {
        tail.next = nodes[game_id];
        tail = nodes[game_id];
      }

      length++;

      return game_id;
    }
  , update : function(game_id, sid, fen) {
      nodes[game_id].data.state.fen = fen;

      var w = nodes[game_id].data.state.white
        , b = nodes[game_id].data.state.black;

      return (sid == w) ? b : w;
    }
  , rm : function(game_id) {
      var node = nodes[game_id];

      if (node == null) return; // opponent already quit

      if (node.next == null) {
        tail = node.prev;
      } else if (node.prev == null) {
        head = node.next
      } else {
        node.prev.next = node.next
        node.next.prev = node.prev
      }

      delete nodes[game_id];
      length--;
    }

  // etc
  , get_head : function() {
      return head;
    }
  , add_watcher : function(game, sid) {
      if (nodes[game]) nodes[game].data.watchers.push(sid);
    }
  , get_states : function(game) {
      var node = nodes[game]
        , states = {};

      if (!node) return;

      states["primary"] = node.data.state;

      if (node.next) states["right"] = node.next.data.state;
      else if (head) states["right"] = head.data.state;
      else return;

      if (node.prev) states["left"] = node.prev.data.state;
      else if (tail) states["left"] = tail.data.state;
      else return;

      return states;
    }
  , get_watchers : function(game) {
      var node = nodes[game];

      if (!node) return;

      var watchers = node.data.watchers;

      if (node.next) array_union(watchers, node.next.data.watchers);
      else if (head) array_union(watchers, head.data.watchers);
      else return;

      if (node.prev) array_union(watchers, node.prev.data.watchers);
      else if (tail) array_union(watchers, tail.data.watchers);
      else return;

      return watchers;
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

    var game_id = (color == "w") ? games.new(sid, opp) : games.new(opp, sid);
    clients[sid].game = clients[opp].game = game_id;

    log.info("game " + game_id + " created for " + sid + " and " + opp);

    ret.game = game_id;
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

  var game_id = clients[sid].game
    , opp_id = games.update(game_id, sid, fen);

  return { game: game_id, opp_id: opp_id }
}

exports.kibitz = function(sid, name) {
  add_client(sid, name);

  var game = games.get_head();
  games.add_watcher(game, sid);

  return { game: game.id, states: games.get_states(game.id) };
}

exports.quit = function(sid) {
  var game_id = clients[sid].game
    , data = null;

  if (game_id) {
    var opp_id = games.rm(game_id);
    if (opp_id && clients[opp_id].game) delete clients[opp_id].game; // else opponent already quit

    data = { game: game_id, opp_id: opp_id };
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

function array_union(a1, a2) {
  for (var i = 0, l = a2.length; i < l; i++) a1.push(a2[i]);
}
