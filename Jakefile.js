desc("This is the default task.");
task("default", [], function () {
  console.log("This is the default task.");
  console.log(require("util").inspect(arguments));
});

desc("A task for running node-linter on the app directory of the project");
task("linter", [], function() {
  var linter = require("node-linter");

  linter.run({ files: "./app"
             , config: "./node_modules/node-linter/conf/server.json"
             , confRoot: "./node_modules/node-linter/conf"
             , recursive: true
             , format: true
             , callback: function(errors) { console.log(errors); }
             });
});
