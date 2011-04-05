var bughouse = require("./../m/bughouse");
bughouse.gourdian = exports.gourdian;

exports.handle_message = function(client, message) {
  var sid = client.sessionId;

  if (message.action == "join") {
    var name = message.data.name
      , data = bughouse.join(sid, name);

    if (data) {
      var gid = data.gid
        , opp_id = data.opp
        , opp = exports.gourdian.socket.clients[opp_id]
        , color = data[sid]
        , opp_color = color == "w" ? "b" : "w";

      exports.gourdian.logger.info("user with name " + name + ", sid " + sid + " joined; assigned: " + color + "; opponent: " + opp_id + " " + opp_color);

      client.send({play: 1, gid: gid, color: color, states: data.states});
      opp.send({play: 1, gid: gid, color: opp_color, states: data.states});
    } else {
      exports.gourdian.logger.info("user with name " + name + " joined; held");
      client.send({hold: 1});
    }
  } else if (message.action == "pos") {
    var from = message.data.f
      , to = message.data.t;

    bughouse.update(sid, from, to, function(data) {
      if (!data) return; // client disconnected during an update

      var gid = data.gid
        , opp_id = data.opp_id
        , opp = exports.gourdian.socket.clients[opp_id]
        , state = data.state
        , watchers = data.watchers;

      opp.send({state: state });

      for (var i = 0, l = watchers.length; i < l; i++) {
        var watcher = exports.gourdian.socket.clients[watchers[i]];
        if (watcher) watcher.send({state: state});
      }

      exports.gourdian.logger.info("recieved move from client with sid: " + sid + "; from " + from + " to " + to + "; opp " + opp_id);
    });
  } else if (message.action == "kibitz") {
    var states = bughouse.kibitz(sid, message.data.name);

    client.send({ kibitz: 1, states: states });
  } else if (message.action == "rot") {
    var data = bughouse.mv_watcher(sid, message.t);

    client.send({ rotate: 1, states: data.states });
  }
}

exports.handle_disconnect = function(client) {
  bughouse.quit(client.sessionId);
};
