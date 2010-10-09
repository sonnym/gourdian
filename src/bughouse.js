  ///////////////////////
 // private variables //
///////////////////////
var board = require("./board").Board
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
      var gid = hash(w + b)
        , hash_l = 6;

      // shorten gid
      while(nodes[gid.substring(0, hash_l)] > -1) hash_l++;
      gid = gid.substring(0, hash_l);

      // create game object in two parts for closure
      nodes[gid] = { next: null
                   , prev: null
                   , state: { private: { white: w
                                       , black: b
                                       , board: new board()
                                       , watchers: []
                                       }
                            , public: null
                            }
                   };
      nodes[gid].state.public = { gid: gid
                                , fen: nodes[gid].state.private.board.get_fen()
                                , b: clients[nodes[gid].state.private.black].name
                                , w: clients[nodes[gid].state.private.white].name
                                , s_w: nodes[gid].state.private.board.get_stash().w
                                , s_b: nodes[gid].state.private.board.get_stash().b
                                };

      // structural changes
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
  , get_node : function(gid) {
      return nodes[gid];
    }
  , add_watcher : function(sid) {
      if (head) head.state.private.watchers.push(sid);

      log.debug("added watcher " + sid + " to game " + head.state.public.id);

      return head.state.public.gid;
    }
  , set_board : function(gid, board) {
      nodes[gid].state.private.board = board;
    }
  , get_states : function(gid) {
      var node = nodes[gid]
        , states = {};

      if (!node) return;

      states["c"] = node.state.public;

      if (node.next) states["r"] = node.next.state.public;
      else if (head && head.state.public.gid != node.state.public.gid) states["r"] = head.state.public;
      else states["r"] = null;

      if (node.prev) states["l"] = node.prev.state.public;
      else if (tail && tail.state.public.gid != node.state.public.gid) states["l"] = tail.state.public;
      else states["l"] = null;

      return states;
    }
  , get_watchers : function(game) {
      var node = nodes[game]
        , watchers = [];

      if (!node) return;

      array_union(watchers, node.state.private.watchers);

      // TODO: add adjacent players

      if (node.next) array_union(watchers, node.next.state.private.watchers);
      else if (head) array_union(watchers, head.state.private.watchers);

      if (node.prev) array_union(watchers, node.prev.state.private.watchers);
      else if (tail) array_union(watchers, tail.state.private.watchers);

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

    ret.gid = clients[sid].gid = clients[opp].gid = gid;
    ret.states = games.get_states(gid);
    ret.opp = opp;
    ret[sid] = color;

    log.info("game " + gid + " created for " + sid + " and " + opp);

    return ret;
  } else {
    waiting.push(sid);

    return null;
  }
}

exports.update = function(sid, from, to, callback) {
  if (!clients[sid]) return; // client disconnected during an update

  var gid = clients[sid].gid
    , node = games.get_node(gid)
    , board = node.state.private.board;

  board.update_state(from, to, function(message) {
    // TODO: promotions

    if (message == "invalid") {
      log.info("client " + sid + " performed an invalid move; from: " + from + "; to: " + to + "; fen: " + board.get_fen());
      // TODO: handle invalid moves?
    } else if (message == "complete") {
      var w = node.state.private.white
        , b = node.state.private.black
        , opp_id = (sid == w) ? b : w
        , watchers = games.get_watchers(gid)

      games.set_board(gid, board);
      games.get_node(gid).state.public.fen = board.get_fen();

      callback({ gid: gid, opp_id: opp_id, watchers: watchers, state: games.get_node(gid).state.public });
    }
  });
}

exports.kibitz = function(sid, name) {
  add_client(sid, name);
  var gid = games.add_watcher(sid);

  return games.get_states(gid);
}

exports.quit = function(sid) {
  var gid = clients[sid].gid
    , ret = null;

  if (gid) {
    var opp_id = games.rm(gid);
    if (opp_id && clients[opp_id].gid) delete clients[opp_id].gid; // else opponent already quit

    // TODO: notify watchers

    ret = { game: gid, opp_id: opp_id };
  }

  client_count--;

  return ret;
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
