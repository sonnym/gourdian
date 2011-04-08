assert = require("assert");

gourdian = {  curriedRequestOn: function(request, callback) {
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
           }

var IntegrationTest = module.exports = function() { };
