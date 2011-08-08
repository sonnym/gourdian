slide = require("slide");
chain = slide.chain;
asyncMap = slide.asyncMap;

var spawn = require("child_process").spawn

  , exclude_from_tests = []

  , server_path = path.join(Gourdian.ROOT, "core", "server.js")
  , log_path = path.join(Gourdian.ROOT, "log", "test.log")

  /*
  , server = spawn(server_path, ["--logfile=" + log_path])
  , server_stdout = server_stderr = ""
  */;

var IntegrationTest = function() {
  Test.call(this);

  // prevent prototype methods from this object being called as tests
  for (var fn_name in this) exclude_from_tests.push(fn_name);
};

inherits(IntegrationTest, Test);

IntegrationTest.prototype.run_tests = function(only_name) {
  for (var test_name in this) {
    if (!Gourdian._.include(exclude_from_tests, test_name)) {
      if (only_name && test_name != only_name) continue;

      try {
        this[test_name]();
        this.pass();
      } catch(e) {
        this.register_error_or_failure(test_name, e);
      }
    }
  }
};

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

module.exports = IntegrationTest;
