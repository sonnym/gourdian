HOST = null; // localhost
PORT = 8124

var starttime = (new Date()).getTime();

var handler = require('./handler');

var chess_loop = new function() {
  var games = [];
};

var sessions = new function() {
  var sessions = [];

  this.create = function() {
  };
};

handler.listen(Number(process.env.PORT || PORT), HOST);

handler.get("/", handler.staticHandler("index.html"));
