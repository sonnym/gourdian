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
    mk : function(w, b) {
      var gid = hash(w + b)
        , hash_l = 6;

      // shorten gid
      while(nodes[gid.substring(0, hash_l)] > -1) hash_l++;
      gid = gid.substring(0, hash_l);

      // create game object in two parts for closure
      nodes[gid] = { next: null
                   , prev: null
                   , gid: gid
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
                                , s_w: ""
                                , s_b: ""
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
  , get_position : function(gid) {
      if (nodes[gid].prev) return this.get_position(nodes[gid].prev.gid) + 1;
      else return 1;
    }

  , add_watcher : function(sid) {
      if (head) {
        head.state.private.watchers.push(sid);

        log.debug("added watcher " + sid + "; game_id " + head.state.public.gid);

        return head.state.public.gid;
      } else {
        log.debug("added watcher " + sid + "; no games to watch");

        return null
      }
    }
  , mv_watcher : function(sid, from, to) {
      var node = games.get_node(clients[sid].watch)
        , watchers = node.state.private.watchers
        , watcher_index = watchers.indexOf(sid)
        , new_gid = null;

      if (watcher_index > -1) node.state.private.watchers = watchers.splice(watcher_index, 1);

      if (to == "h") {
        head.state.private.watchers.push(sid);
        new_gid = head.gid;
      } else if (to == "l") {
        if (node.prev) {
          node.prev.state.private.watchers.push(sid);
          new_gid = node.prev.gid;
        } else {
          tail.state.private.watchers.push(sid);
          new_gid = tail.gid;
        }
      } else if (to == "r") {
        if (node.next) {
          node.next.state.private.watchers.push(sid);
          new_gid = node.next.gid;
        } else {
          head.state.private.watchers.push(sid);
          new_gid = head.gid;
        }
      } else if (to == "t") {
        tail.state.private.watchers.push(sid);
        new_gid = tail.gid;
      }

      return new_gid;
    }

  , set_board : function(gid, board) {
      nodes[gid].state.private.board = board;
    }
  , carry_over : function(gid, piece) {
      var ascii = piece.charCodeAt(0)
        , node = nodes[gid]
        , to_gid;

      if (node.next) {
        to_node = node.next;
      } else if (head.gid != gid) {
        to_node = head;
      }

      if (to_node) {
        if (ascii > 64 && ascii < 91) {
          to_node.state.public.s_w += piece;
        } else if (ascii > 96 && ascii < 123) {
          to_node.state.public.s_b += piece;
        }
      } else {
        log.debug("piece captured in game " + gid + "; failed to find destination game");
      }
    }
  , get_states : function(gid) {
      var node = nodes[gid]
        , states = {};

      if (!node) return;

      states["c"] = node.state.public;

      if (node.next) states["r"] = node.next.state.public;
      else if (head && head.gid != node.gid && (node.prev && head.gid != node.prev.gid)) states["r"] = head.state.public;
      else states["r"] = null;

      if (node.prev) states["l"] = node.prev.state.public;
      else if (tail && tail.gid != node.gid && (node.next && tail.gid != node.next.gid)) states["l"] = tail.state.public;
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

    var gid = (color == "w") ? games.mk(sid, opp) : games.mk(opp, sid);

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

  board.update_state(from, to, function(message, captured) {
    // TODO: promotions

    if (message == "invalid") {
      log.info("client " + sid + " performed an invalid move; from: " + from + "; to: " + to + "; fen: " + board.get_fen());
      // TODO: handle invalid moves?
    } else if (message == "complete") {
      var w = node.state.private.white
        , b = node.state.private.black
        , opp_id = (sid == w) ? b : w
        , watchers = games.get_watchers(gid)

      if (captured) {
        games.carry_over(gid, captured);
      }

      games.set_board(gid, board);
      games.get_node(gid).state.public.fen = board.get_fen();

      if (callback) callback({ gid: gid, opp_id: opp_id, watchers: watchers, state: games.get_node(gid).state.public });
    }
  });
}

exports.kibitz = function(sid, name) {
  var gid = games.add_watcher(sid);

  add_client(sid, name, gid);

  return games.get_states(gid);
}

exports.mv_watcher = function(sid, to) {
  if (!clients[sid]) return;

  var client = clients[sid]
    , watch = clients[sid].watch
    , new_gid = games.mv_watcher(sid, watch, to);

  client.watch = new_gid;

  return { states: games.get_states(new_gid) };
}

exports.quit = function(sid) {
  var gid = clients[sid].gid
    , watch = clients[sid].gid
    , ret = null;

  if (gid) {
    var opp_id = games.rm(gid);
    if (opp_id && clients[opp_id].gid) delete clients[opp_id].gid; // else opponent already quit

    // TODO: notify watchers

    ret = { game: gid, opp_id: opp_id };
  } else if (watch) {
    var idx = games.get_node(watch).state.private.watchers.indexOf(sid);
    if (idx > -1) games.get_node(gid).state.private.watchers = games.get_node(gid).watchers.splice(idx, 1);
  }

  delete clients[sid];
  client_count--;

  return ret;
}

  /////////////////////
 // private methods //
/////////////////////
function add_client(sid, name, watch) {
  if (clients[sid]) return;

  clients[sid] = { name: name };

  if (watch) clients[sid].watch = watch;

  client_count++;
}

function array_union(a1, a2) {
  for (var i = 0, l = a2.length; i < l; i++) a1.push(a2[i]);
}
