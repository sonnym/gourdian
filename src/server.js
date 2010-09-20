HOST = null; // localhost
PORT = 8124

var starttime = (new Date()).getTime();

var handler = require('./handler');

var chess_loop = new function() {
  var games = [];
};

handler.listen(Number(process.env.PORT || PORT), HOST);

handler.get("/", handler.staticHandler("index.html"));
handler.get("/client.js", handler.staticHandler("client.js"));
handler.get("/client.css", handler.staticHandler("client.css"));
handler.get("/lib/jquery-1.4.2.min.js", handler.staticHandler("lib/jquery-1.4.2.min.js"));
handler.get("/lib/jquery-ui-1.8.4.custom.min.js", handler.staticHandler("lib/jquery-ui-1.8.4.custom.min.js"));
handler.get("/lib/awesome-buttons/awesome-buttons.css", handler.staticHandler("lib/awesome-buttons/awesome-buttons.css"));
