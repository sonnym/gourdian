  ///////////////////////
 // private variables //
///////////////////////
var board = require("./board")
  , crypto = require("crypto")
  , log = require("./log")
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
      var gid = hash(w + b);

      nodes[gid] = { next: null
                       , prev: null
                       , data:
                          { state: { private: { white: w, black: b, board: new Board() }
                                   , public: { id: gid, fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", stash_w: null, stash_b: null }
                                   }
                          , watchers: []
                          }
                       };

      if (length == 0) {
        head = nodes[gid];
        tail = nodes[gid];
      } else {
        tail.next = nodes[gid];
        nodes[gid].prev = tail;

        tail = nodes[gid];
      }

      length++;

      return gid;
    }
  , update : function(gid, sid, fen) {
      nodes[gid].data.state.public.fen = fen;

      var w = nodes[gid].data.state.private.white
        , b = nodes[gid].data.state.private.black;

      return (sid == w) ? b : w;
    }
  , rm : function(gid) {
      var node = nodes[gid];

      if (node == null) return; // opponent already quit

      if (node.next == null) {
        tail = node.prev;
      } else if (node.prev == null) {
        head = node.next
      } else {
        node.prev.next = node.next
        node.next.prev = node.prev
      }

      delete nodes[gid];
      length--;
    }

  // etc
  , add_watcher : function(sid) {
      if (head) head.data.watchers.push(sid);

      log.debug("added watcher " + sid + " to game " + head.data.state.public.id);

      return head.data.state.public.id;
    }
  , get_states : function(gid) {
      var node = nodes[gid]
        , states = {};

      if (!node) return;

      states["c"] = node.data.state.public;

      if (node.next) states["r"] = node.next.data.state.public;
      else if (head) states["r"] = head.data.state.public;
      else return;

      if (node.prev) states["l"] = node.prev.data.state.public;
      else if (tail) states["l"] = tail.data.state.public;
      else return;

      // TODO: add names to states

      return states;
    }
  , get_watchers : function(game) {
      var node = nodes[game]
        , watchers = [];

      if (!node) return;

      array_union(watchers, node.data.watchers);

      // TODO: add adjacent players

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

    var gid = (color == "w") ? games.new(sid, opp) : games.new(opp, sid);
    clients[sid].game = clients[opp].game = gid;

    log.info("game " + gid + " created for " + sid + " and " + opp);

    ret.game = gid;
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

  var gid = clients[sid].game
    , opp_id = games.update(gid, sid, fen)
    , watchers = games.get_watchers(gid);

  return { gid: gid, opp_id: opp_id, watchers: watchers }
}

exports.kibitz = function(sid, name) {
  add_client(sid, name);
  var gid = games.add_watcher(sid);

  return games.get_states(gid);
}

exports.quit = function(sid) {
  var gid = clients[sid].game
    , data = null;

  if (gid) {
    var opp_id = games.rm(gid);
    if (opp_id && clients[opp_id].game) delete clients[opp_id].game; // else opponent already quit

    // TODO: notify watchers

    data = { game: gid, opp_id: opp_id };
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
