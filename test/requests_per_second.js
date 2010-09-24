// was uninspired by the offerings
var grow = (function() {
  var spawn = require("child_process").spawn
      , sys = require('sys')

      , clients = []
      , v8_memory = function() { return sys.inspect(process.memoryUsage()) };

    while (true) {
      clients.push((function() {
        var http = require("http")
          , server = http.createClient("8124");

        return server.request("GET", "/").on("response", function(response) { response.on("end"), function() { request() } });
      })());
        
      
      var count = clients.length
        ,  count_output = function() { console.log(v8_memory.heapUsed + " / " + v8_memory.heapTotal + " heap; " + count + " clients ") };

      if (count < 500 && count % 10 == 0) count_output();
      else if (count < 5000 && count % 100 == 0) count_output();
      else if (count < 50000 && count % 1000 == 0) count_output(); // surely 50000 is high
      else count_output();
    }
})();
