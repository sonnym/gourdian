assert = require("assert");

gourdian = { curriedRequestOn: function(request, callback) {
               var done = false
                 , error = null;

               request.on("response", function(response) {
                 try {
                   callback(response);
                 } catch (e) {
                   error = e;
                 }
                 done = true;
               });

               return { get_done: function() { return done }
                      , get_error: function() { return error }
                      };
             }
             , curriedWebsocketAddListener: function(client, callback) {
               var done = false
                 , error = null;

               client.addListener("data", function(buffer) {
                 try {
                   callback(buffer);
                 } catch (e) {
                   error = e;
                 }
                 done = true;
               });

               return { get_done: function() { return done }
                      , get_error: function() { return error }
                      };
             }
             , curriedWebsocketOnMessage: function(client, callback) {
               var done = false
                 , error = null;

               client.onmessage = function(message, conditions) {
                 try {
                   callback(message);
                 } catch (e) {
                   error = e;
                 }
                 done = true;
               };

               return { get_done: function() { return done }
                      , get_error: function() { return error }
                      };
             }
           }

var IntegrationTest = module.exports = function() { };
