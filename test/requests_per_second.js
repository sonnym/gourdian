// was uninspired by the offerings
(function() {
  var http = require("http")

    , clients = [];

  while (true) {
    clients.push((function() {
      var request
        , localhost = http.createClient(8124)

      function req() {
        request = localhost.request("GET", "/");
        request.end();

        res();
      }
      function res() {
        request.on("response", function(response) {
          response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
          });
          console.log(response.statusCode);

          response.on("end", function() {
           req();
          });
        });
      }

      req();
    })());

    var count = clients.length
      , count_output = function() { console.log(count + " clients ") };

    if (count < 500 && count % 10 == 0) count_output();
    else if (count < 5000 && count % 100 == 0) count_output();
    else if (count < 50000 && count % 1000 == 0) count_output(); // surely 50000 is high
    else if (count > 50000) count_output();
  }
})();
