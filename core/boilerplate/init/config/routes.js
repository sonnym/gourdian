module.exports = function() { return {
  http: [ { root: "public" }
        , { path: "/welcome", controller: "welcome", action: "index" }
        ],
  socket: [ ]
} };
