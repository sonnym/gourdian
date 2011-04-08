module.exports = function() { return {
  http: [ { root: "public" }
        , { path: "/lib/socket.io.js", file: "node_modules/socket.io/support/socket.io-client/socket.io.js" }
        , { path: "/transporter/receiver.js", file: "node_modules/transporter/lib/receiver.js" }
        ],

  socket: [ { message: "*", controller: "bughouse", action: "handle_message" }
          , { message: "disconnect", controller: "bughouse", action: "handle_disconnect" }
          ]
} };
